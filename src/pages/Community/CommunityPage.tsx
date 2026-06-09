import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Users, Image, Info, Search, X, UserPlus } from "lucide-react";
import { communitiesApi } from "@/api/communities";
import { useAuthStore } from "@/store/authStore";
import { usersApi } from "@/api/users";
import type { User } from "@/types";
import {
  useCommunityPostsInfinite,
  useInfiniteScroll,
} from "@/hooks/useInfinitePosts";

import CommunityBanner from "./CommunityBanner";
import CommunityEditModal from "./CommunityEditModal";
import CommunityPostsTab from "./CommunityPostsTab";
import CommunityMembersTab from "./CommunityMembersTab";
import CommunityGalleryTab from "./CommunityGalleryTab";
import CommunityAboutTab from "./CommunityAboutTab";
import PageMeta from "@/components/shared/PageMeta";
import LeaveOwnershipModal from "./LeaveOwnershipModal";

type Tab = "posts" | "members" | "gallery" | "about";

const TABS = [
  { value: "posts",   label: "Postovi",    icon: FileText },
  { value: "members", label: "Članovi",    icon: Users },
  { value: "gallery", label: "Galerija",   icon: Image },
  { value: "about",   label: "O zajednici", icon: Info },
] as const;

// ─── Invite user modal (local, only used here) ─────────────────────────────────

const InviteUserModal = ({
  onClose,
  onAdd,
  isPending,
}: {
  onClose: () => void;
  onAdd: (userId: string) => void;
  isPending: boolean;
}) => {
  const [q, setQ] = useState("");
  const { data: users } = useQuery({
    queryKey: ["users", "search-invite", q],
    queryFn: () => usersApi.search(q),
    enabled: q.length >= 2,
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-semibold text-[15px] text-text-1">Pozovi u zajednicu</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraži korisnike..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-[13px] outline-none focus:border-accent bg-surface-2"
            />
          </div>
          {q.length < 2 && (
            <p className="text-[12px] text-text-3 text-center py-4">Unesi bar 2 slova</p>
          )}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {users?.map((u: User) => (
              <div
                key={u.id}
                onClick={() => !isPending && onAdd(u.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-2-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden shrink-0 border border-border">
                  {u.avatar ? (
                    <img loading="lazy" src={u.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    u.username.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-1">{u.username}</div>
                  {u.bio && <div className="text-[11px] text-text-3 truncate">{u.bio}</div>}
                </div>
                <UserPlus size={14} className="text-accent shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isInvited, setIsInvited] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────────────────────

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", slug],
    queryFn: () => communitiesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (community && isMember === null) {
    setIsMember(community.isMember ?? false);
    setIsInvited((community as any).isInvited ?? false);
  }

  const { data: members } = useQuery({
    queryKey: ["members", community?.id],
    queryFn: () => communitiesApi.getMembers(community!.id),
    enabled: !!community?.id && (activeTab === "members" || showLeaveModal),
  });

  const { data: myRole } = useQuery({
    queryKey: ["community-role", community?.id],
    queryFn: () => communitiesApi.getMyRole(community!.id),
    enabled: !!community?.id && !!user,
  });

  const myRoleStr = useMemo(
    () => (typeof myRole === "string" ? myRole : ((myRole as any)?.role ?? null)),
    [myRole]
  );
  const isOwner = useMemo(() => myRoleStr === "owner", [myRoleStr]);
  const isMod = useMemo(() => myRoleStr === "moderator" || isOwner, [myRoleStr, isOwner]);

  const {
    posts,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityPostsInfinite(community?.id ?? "");

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  // ─── Mutations ────────────────────────────────────────────────────────────────

  const invalidateCommunity = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["community", slug] });
    queryClient.invalidateQueries({ queryKey: ["communities"] });
  }, [queryClient, slug]);

  const joinMutation = useMutation({
    mutationFn: () => communitiesApi.join(community!.id),
    onSuccess: () => {
      toast.success("Pridružio/la si se zajednici!");
      setIsMember(true);
      invalidateCommunity();
      queryClient.invalidateQueries({ queryKey: ["posts", "feed", "infinite"] });
    },
    onError: () => toast.error("Pridruživanje nije uspelo"),
  });

  const leaveMutation = useMutation({
    mutationFn: (newOwnerId?: string) => communitiesApi.leaveCommunity(community!.id, newOwnerId),
    onSuccess: () => {
      toast.success("Napustio/la si zajednicu");
      setIsMember(false);
      setShowLeaveModal(false);
      invalidateCommunity();
      queryClient.invalidateQueries({ queryKey: ["posts", "feed", "infinite"] });
      navigate("/communities");
    },
    onError: () => toast.error("Napuštanje nije uspelo"),
  });

  const acceptInviteMutation = useMutation({
    mutationFn: () => communitiesApi.acceptInvite(community!.id),
    onSuccess: () => {
      toast.success("Pridružio/la si se zajednici!");
      setIsMember(true);
      setIsInvited(false);
      invalidateCommunity();
      queryClient.invalidateQueries({ queryKey: ["posts", "feed", "infinite"] });
    },
    onError: () => toast.error("Prihvatanje poziva nije uspelo"),
  });

  const rejectInviteMutation = useMutation({
    mutationFn: () => communitiesApi.rejectInvite(community!.id),
    onSuccess: () => {
      toast.success("Poziv je odbijen");
      setIsInvited(false);
      invalidateCommunity();
    },
    onError: () => toast.error("Odbijanje poziva nije uspelo"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => communitiesApi.deleteCommunity(community!.id),
    onSuccess: () => {
      toast.success("Zajednica je obrisana");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      navigate("/communities");
    },
    onError: () => toast.error("Brisanje zajednice nije uspelo"),
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => communitiesApi.directAddMember(community!.id, userId),
    onSuccess: () => {
      toast.success("Pozivnica je poslata");
      queryClient.invalidateQueries({ queryKey: ["members", community?.id] });
      setShowInvite(false);
    },
    onError: () => toast.error("Slanje pozivnice nije uspelo"),
  });

  // ─── Render ───────────────────────────────────────────────────────────────────

  // ─── Stable handlers for memoized children ────────────────────────────────────

  const handleJoin           = useCallback(() => joinMutation.mutate(), [joinMutation]);
  const handleLeave          = useCallback(() => leaveMutation.mutate(undefined), [leaveMutation]);
  const handleAcceptInvite   = useCallback(() => acceptInviteMutation.mutate(), [acceptInviteMutation]);
  const handleRejectInvite   = useCallback(() => rejectInviteMutation.mutate(), [rejectInviteMutation]);
  const handleDelete         = useCallback(() => deleteMutation.mutate(), [deleteMutation]);
  const handleShowInvite     = useCallback(() => setShowInvite(true), []);
  const handleShowEdit       = useCallback(() => setShowEdit(true), []);
  const handleShowLeaveModal = useCallback(() => setShowLeaveModal(true), []);
  const handleCloseEdit      = useCallback(() => setShowEdit(false), []);
  const handleCloseInvite    = useCallback(() => setShowInvite(false), []);
  const handleCloseLeave     = useCallback(() => setShowLeaveModal(false), []);
  const handleAddMember      = useCallback((userId: string) => addMemberMutation.mutate(userId), [addMemberMutation]);
  const handleLeaveWithOwner = useCallback((newOwnerId?: string) => leaveMutation.mutate(newOwnerId), [leaveMutation]);

  if (isLoading)
    return <div className="flex items-center justify-center p-20 text-text-3">Učitavam zajednicu...</div>;

  if (!community)
    return (
      <div className="text-center p-20">
        <div className="text-[32px] mb-3">🔍</div>
        <div className="font-serif text-[15px] text-text-1">Zajednica nije pronađena</div>
      </div>
    );

  return (
    <div>
      <PageMeta
        title={community.name}
        description={community.description ?? `Zajednica ${community.name} na Spektru Beograda.`}
        image={community.banner ?? community.avatar ?? undefined}
        path={`/c/${slug}`}
      />
      {/* Modals */}
      {showEdit && (
        <CommunityEditModal community={community} slug={slug!} onClose={handleCloseEdit} />
      )}
      {showInvite && (
        <InviteUserModal
          onClose={handleCloseInvite}
          onAdd={handleAddMember}
          isPending={addMemberMutation.isPending}
        />
      )}
      {showLeaveModal && (
        <LeaveOwnershipModal
          members={members ?? []}
          currentUserId={user?.id ?? ""}
          isPending={leaveMutation.isPending}
          onClose={handleCloseLeave}
          onLeave={handleLeaveWithOwner}
        />
      )}

      {/* Banner */}
      <CommunityBanner
        community={community}
        slug={slug!}
        isMember={isMember ?? false}
        isInvited={isInvited}
        isOwner={isOwner}
        isOwnerOrMod={isMod}
        isAuthenticated={isAuthenticated}
        joinPending={joinMutation.isPending}
        leavePending={leaveMutation.isPending}
        acceptPending={acceptInviteMutation.isPending}
        rejectPending={rejectInviteMutation.isPending}
        deletePending={deleteMutation.isPending}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
        onDelete={handleDelete}
        onShowInvite={handleShowInvite}
        onShowEdit={handleShowEdit}
        onShowLeaveModal={handleShowLeaveModal}
      />

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-border bg-surface rounded-t-xl sm:px-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-x-auto">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex items-center gap-1.5 px-2 sm:px-4 py-3 text-[12px] sm:text-[13px] font-medium border-none bg-transparent cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              activeTab === value
                ? "border-accent text-accent"
                : "border-transparent text-text-3 hover:text-text-1"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <CommunityPostsTab
          posts={posts}
          isLoading={postsLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={sentinelRef}
        />
      )}
      {activeTab === "members" && (
        <CommunityMembersTab
          community={community}
          members={members ?? []}
          isOwner={isOwner}
          isMod={isMod}
          currentUserId={user?.id}
          onShowInvite={handleShowInvite}
        />
      )}
      {activeTab === "gallery" && (
        <CommunityGalleryTab
          community={community}
          isMember={isMember ?? false}
          isMod={isMod}
        />
      )}
      {activeTab === "about" && (
        <CommunityAboutTab community={community} />
      )}
    </div>
  );
};

export default CommunityPage;
