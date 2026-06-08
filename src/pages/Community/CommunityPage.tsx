import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";
import { uploadApi } from "@/api/upload";
import { useAuthStore } from "@/store/authStore";
import PostCard from "@/pages/Feed/PostCard";
import {
  Camera,
  ImagePlus,
  Users,
  FileText,
  Info,
  Image,
  Pencil,
  X,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Search,
  Check,
  Loader2,
  Trash2,
  UserX,
  Ban,
  LogOut,
} from "lucide-react";
import {
  useCommunityPostsInfinite,
  useInfiniteScroll,
} from "@/hooks/useInfinitePosts";
import { usersApi } from "@/api/users";
import type { User } from "@/types";
import ImageLightbox from "@/components/shared/ImageLightbox";

const FILTERS = [
  { label: "Svi", value: "" },
  { label: "Diskusije", value: "discussion" },
  { label: "Pitanja", value: "question" },
  { label: "Događaji", value: "event" },
  { label: "Preporuke", value: "recommendation" },
  { label: "Obaveštenja", value: "announcement" },
];

const CATEGORY_SR: Record<string, string> = {
  neighborhood: "Kvart / Komšiluk",
  hobby: "Hobi",
  sport: "Sport",
  food: "Hrana i piće",
  events: "Događaji",
  other: "Ostalo",
};

const TYPE_SR: Record<string, string> = {
  public: "Javna",
  restricted: "Ograničena",
  private: "Privatna",
};

const ROLE_SR: Record<string, string> = {
  owner: "Vlasnik",
  moderator: "Moderator",
  member: "Član",
};

type Tab = "posts" | "members" | "gallery" | "about";

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
          <span className="font-semibold text-[15px] text-text-1">
            Pozovi u zajednicu
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraži korisnike..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-[13px] outline-none focus:border-accent bg-surface-2"
            />
          </div>
          {q.length < 2 && (
            <p className="text-[12px] text-text-3 text-center py-4">
              Unesi bar 2 slova
            </p>
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
                    <img
                      src={u.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    u.username.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-1">
                    {u.username}
                  </div>
                  {u.bio && (
                    <div className="text-[11px] text-text-3 truncate">
                      {u.bio}
                    </div>
                  )}
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

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isInvited, setIsInvited] = useState<boolean>(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatarUploading, setEditAvatarUploading] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", slug],
    queryFn: () => communitiesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (community && isMember === null) {
    setIsMember(community.isMember ?? false);
    setIsInvited((community as any).isInvited ?? false);
  }

  const {
    posts: allCommunityPosts,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityPostsInfinite(community?.id ?? "");

  const { data: members } = useQuery({
    queryKey: ["members", community?.id],
    queryFn: () => communitiesApi.getMembers(community!.id),
    enabled: !!community?.id && activeTab === "members",
  });

  const { data: myRole } = useQuery({
    queryKey: ["community-role", community?.id],
    queryFn: () => communitiesApi.getMyRole(community!.id),
    enabled: !!community?.id && !!user,
  });

  const myRoleStr =
    typeof myRole === "string" ? myRole : ((myRole as any)?.role ?? null);
  const isOwner = myRoleStr === "owner";
  const isMod = myRoleStr === "moderator" || isOwner;

  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "moderator" | "member";
    }) => communitiesApi.setMemberRole(community!.id, userId, role),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["members", community?.id] }),
  });

  const kickMutation = useMutation({
    mutationFn: (userId: string) => communitiesApi.kickMember(community!.id, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["members", community?.id] }),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => communitiesApi.banMember(community!.id, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["members", community?.id] }),
  });

  const leaveMutation = useMutation({
    mutationFn: (newOwnerId?: string) => communitiesApi.leaveCommunity(community!.id, newOwnerId),
    onSuccess: () => {
      setIsMember(false);
      setShowLeaveModal(false);
      setSelectedNewOwner("");
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      navigate("/communities");
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: () => communitiesApi.acceptInvite(community!.id),
    onSuccess: () => {
      setIsMember(true);
      setIsInvited(false);
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });

  const rejectInviteMutation = useMutation({
    mutationFn: () => communitiesApi.rejectInvite(community!.id),
    onSuccess: () => {
      setIsInvited(false);
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: () => communitiesApi.deleteCommunity(community!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      navigate("/communities");
    },
  });

  const { data: gallery, refetch: refetchGallery } = useQuery({
    queryKey: ["gallery", community?.id],
    queryFn: () => communitiesApi.getGallery(community!.id),
    enabled: !!community?.id && activeTab === "gallery",
  });

  const { data: pendingGallery, refetch: refetchPendingGallery } = useQuery({
    queryKey: ["gallery-pending", community?.id],
    queryFn: () => communitiesApi.getPendingGallery(community!.id),
    enabled: !!community?.id && activeTab === "gallery" && isMod,
  });

  const approveImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      communitiesApi.approveGalleryImage(imageId),
    onSuccess: () => {
      refetchGallery();
      refetchPendingGallery();
    },
  });

  const rejectImageMutation = useMutation({
    mutationFn: (imageId: string) => communitiesApi.rejectGalleryImage(imageId),
    onSuccess: () => refetchPendingGallery(),
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      communitiesApi.directAddMember(community!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", community?.id] });
      setShowInvite(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      location?: string;
      avatar?: string;
    }) => communitiesApi.update(community!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      setShowEdit(false);
    },
  });

  const openEdit = () => {
    setEditName(community?.name ?? "");
    setEditDescription(community?.description ?? "");
    setEditLocation(community?.location ?? "");
    setEditAvatarUrl(community?.avatar ?? "");
    setShowEdit(true);
  };

  const handleEditAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setEditAvatarUrl(url);
    } finally {
      setEditAvatarUploading(false);
    }
  };

  const joinMutation = useMutation({
    mutationFn: () => communitiesApi.join(community!.id),
    onSuccess: () => {
      setIsMember(true);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !community) return;
    setBannerUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      await communitiesApi.updateBanner(community.id, url);
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
    } finally {
      setBannerUploading(false);
    }
  };

  // const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file || !community) return;
  //   setGalleryUploading(true);
  //   try {
  //     const url = await uploadApi.uploadImage(file);
  //     await communitiesApi.getGallery(community.id); // trigger gallery endpoint with upload
  //     // actually use the upload endpoint
  //     await fetch(`/communities/${community.id}/gallery`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  //       body: JSON.stringify({ imageUrl: url }),
  //     });
  //     refetchGallery();
  //   } finally {
  //     setGalleryUploading(false);
  //   }
  // };

  const handleGalleryUploadViaApi = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !community) return;
    setGalleryUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      await communitiesApi.getGallery(community.id);
      // Use axios instance
      const { default: api } = await import("@/api/axios");
      await api.post(`/communities/${community.id}/gallery`, { imageUrl: url });
      refetchGallery();
    } finally {
      setGalleryUploading(false);
    }
  };

  const filtered = activeFilter
    ? allCommunityPosts.filter((p) => p.type === activeFilter)
    : allCommunityPosts;
  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-20 text-text-3">
        Učitavam zajednicu...
      </div>
    );
  if (!community)
    return (
      <div className="text-center p-20">
        <div className="text-[32px] mb-3">🔍</div>
        <div className="font-serif text-[15px] text-text-1">
          Zajednica nije pronađena
        </div>
      </div>
    );

  const isOwnerOrMod = isMod;

  const TABS = [
    { value: "posts", label: "Postovi", icon: FileText },
    { value: "members", label: "Članovi", icon: Users },
    { value: "gallery", label: "Galerija", icon: Image },
    { value: "about", label: "O zajednici", icon: Info },
  ] as const;

  return (
    <div>
      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-[15px] text-text-1">
                Uredi zajednicu
              </span>
              <button
                onClick={() => setShowEdit(false)}
                className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-14 h-14 rounded-xl bg-accent-soft border-2 border-dashed border-accent/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-accent transition-colors"
                >
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={20} className="text-accent/50" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditAvatarUpload}
                  className="hidden"
                />
                <div>
                  <div className="text-[13px] font-medium text-text-1">
                    Avatar zajednice
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    {editAvatarUploading ? "Učitavam..." : "Klikni da promeniš"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
                  Naziv
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent font-serif bg-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
                  Opis
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-2 outline-none focus:border-accent resize-none font-sans bg-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
                  Lokacija
                </label>
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="npr. Vračar, Beograd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2-2"
                >
                  Otkaži
                </button>
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      name: editName || undefined,
                      description: editDescription || undefined,
                      location: editLocation || undefined,
                      avatar: editAvatarUrl || undefined,
                    })
                  }
                  disabled={updateMutation.isPending || !editName.trim()}
                  className="px-5 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Čuvam..." : "Sačuvaj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteUserModal
          onClose={() => setShowInvite(false)}
          onAdd={(userId) => addMemberMutation.mutate(userId)}
          isPending={addMemberMutation.isPending}
        />
      )}

      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-5 h-52 shadow-[0_4px_20px_rgba(0,0,0,0.12)] group">
        {community.banner ? (
          <img
            src={community.banner}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d4f2e] via-[#1a8a57] to-[#3ab878]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Banner upload button (owner/mod only) */}
        {isOwnerOrMod && (
          <>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-white text-[12px] border border-white/20 cursor-pointer backdrop-blur-sm hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Camera size={13} />
              {bannerUploading ? "Učitavam..." : "Promeni sliku"}
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-end gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden backdrop-blur-sm">
              {community.avatar ? (
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                community.name.slice(0, 1)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="font-serif text-[18px] sm:text-[22px] text-white leading-tight truncate">
                  {community.name}
                </h1>
                {community.type !== "public" && (
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm shrink-0">
                    🔒 {TYPE_SR[community.type]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-[12px] text-white/80">
                  {community.membersCount.toLocaleString("sr-RS")} članova
                </span>
                {community.location && (
                  <>
                    <span className="text-white/40">·</span>
                    <span className="text-[11px] sm:text-[12px] text-white/70 truncate">
                      📍 {community.location}
                    </span>
                  </>
                )}
              </div>
              {/* Actions row on mobile — shown below title */}
              <div className="flex gap-1.5 mt-2 sm:hidden flex-wrap">
                {isMember ? (
                  <>
                    <span className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-[12px] border border-white/25 backdrop-blur-sm">
                      ✓ Član
                    </span>
                    <button
                      onClick={() => {
                        if (isOwner) {
                          setShowLeaveModal(true);
                        } else if (window.confirm("Napustiti ovu zajednicu?")) {
                          leaveMutation.mutate(undefined);
                        }
                      }}
                      disabled={leaveMutation.isPending}
                      title="Napusti zajednicu"
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/40 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <LogOut size={12} />
                    </button>
                  </>
                ) : isInvited ? (
                  <>
                    <button
                      onClick={() => acceptInviteMutation.mutate()}
                      disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors"
                    >
                      {acceptInviteMutation.isPending ? "..." : "✓ Prihvati poziv"}
                    </button>
                    <button
                      onClick={() => rejectInviteMutation.mutate()}
                      disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-red-500/40 text-white text-[12px] border border-white/25 cursor-pointer backdrop-blur-sm transition-colors"
                    >
                      {rejectInviteMutation.isPending ? "..." : "✕ Odbij"}
                    </button>
                  </>
                ) : community.type === "public" ? (
                  <button
                    onClick={() =>
                      isAuthenticated
                        ? joinMutation.mutate()
                        : navigate("/login", { state: { from: { pathname: `/c/${slug}` } } })
                    }
                    disabled={joinMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors"
                  >
                    {joinMutation.isPending ? "..." : "Pridruži se"}
                  </button>
                ) : null}
                {isMember && (
                  <button
                    onClick={() => navigate(`/new-post?community=${community.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[12px] border border-white/25 cursor-pointer backdrop-blur-sm transition-colors"
                  >
                    + Objavi
                  </button>
                )}
                {isOwnerOrMod && (
                  <>
                    <button
                      onClick={() => setShowInvite(true)}
                      className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm flex items-center justify-center transition-colors"
                    >
                      <UserPlus size={13} />
                    </button>
                    <button
                      onClick={openEdit}
                      className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm flex items-center justify-center transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Obrisati zajednicu "${community.name}"? Ova akcija je nepovratna.`)) {
                            deleteCommunityMutation.mutate();
                          }
                        }}
                        disabled={deleteCommunityMutation.isPending}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white border border-red-400/30 cursor-pointer backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Actions — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex gap-2 shrink-0">
              {isMember ? (
                <>
                  <span className="px-4 py-2 rounded-xl bg-white/15 text-white text-[13px] border border-white/25 backdrop-blur-sm">
                    ✓ Član
                  </span>
                  <button
                    onClick={() => {
                      if (isOwner) {
                        setShowLeaveModal(true);
                      } else if (window.confirm("Napustiti ovu zajednicu?")) {
                        leaveMutation.mutate(undefined);
                      }
                    }}
                    disabled={leaveMutation.isPending}
                    title="Napusti zajednicu"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-red-500/40 text-white text-[13px] border border-white/20 cursor-pointer backdrop-blur-sm transition-colors disabled:opacity-50"
                  >
                    <LogOut size={14} />
                    <span>Napusti</span>
                  </button>
                </>
              ) : isInvited ? (
                <>
                  <button
                    onClick={() => acceptInviteMutation.mutate()}
                    disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors"
                  >
                    {acceptInviteMutation.isPending ? "..." : "✓ Prihvati poziv"}
                  </button>
                  <button
                    onClick={() => rejectInviteMutation.mutate()}
                    disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-white/15 hover:bg-red-500/40 text-white text-[13px] border border-white/25 cursor-pointer backdrop-blur-sm transition-colors"
                  >
                    {rejectInviteMutation.isPending ? "..." : "✕ Odbij poziv"}
                  </button>
                </>
              ) : community.type === "public" ? (
                <button
                  onClick={() =>
                    isAuthenticated
                      ? joinMutation.mutate()
                      : navigate("/login", { state: { from: { pathname: `/c/${slug}` } } })
                  }
                  disabled={joinMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors"
                >
                  {joinMutation.isPending ? "..." : "Pridruži se"}
                </button>
              ) : null}
              {isMember && <button
                onClick={() => navigate(`/new-post?community=${community.id}`)}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[13px] border border-white/25 cursor-pointer backdrop-blur-sm transition-colors"
              >
                + Objavi
              </button>}
              {isOwnerOrMod && (
                <>
                  <button
                    onClick={() => setShowInvite(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[13px] border border-white/25 cursor-pointer backdrop-blur-sm transition-colors"
                  >
                    <UserPlus size={14} />
                    <span>Pozovi</span>
                  </button>
                  <button
                    onClick={openEdit}
                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Obrisati zajednicu "${community.name}"? Ova akcija je nepovratna.`)) {
                          deleteCommunityMutation.mutate();
                        }
                      }}
                      disabled={deleteCommunityMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-white text-[13px] border border-red-400/30 cursor-pointer backdrop-blur-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>Obriši</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-border bg-surface rounded-t-xl sm:px-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-x-auto scrollbar-hide">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex items-center gap-1.5 px-2 sm:px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-medium border-none bg-transparent cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
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

      {/* Posts tab */}
      {activeTab === "posts" && (
        <>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={[
                  "px-3.5 py-1.5 rounded-lg text-[12.5px] border-none cursor-pointer transition-all font-medium",
                  activeFilter === f.value
                    ? "bg-accent text-white shadow-[0_2px_8px_rgba(26,138,87,0.3)]"
                    : "bg-surface text-text-3 hover:bg-surface-2-2 border border-border",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
          {postsLoading && (
            <div className="text-center p-10 text-text-3">
              Učitavam postove...
            </div>
          )}
          {!postsLoading && filtered?.length === 0 && (
            <div className="text-center p-10 bg-surface rounded-2xl border border-border">
              <div className="text-[32px] mb-3">📭</div>
              <div className="font-serif text-[15px] text-text-1">
                Nema postova
              </div>
              <div className="text-[13px] mt-1 text-text-3">
                Budi prvi koji će nešto objaviti!
              </div>
            </div>
          )}
          {filtered?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-text-3" />
            </div>
          )}
          {!hasNextPage && filtered.length > 0 && (
            <div className="text-center py-6 text-[12px] text-text-3">
              Prikazani su svi postovi
            </div>
          )}
        </>
      )}

      {/* Members tab */}
      {activeTab === "members" && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="px-5 py-4 border-b border-surface-2 flex items-center justify-between">
            <span className="font-semibold text-[14px] text-text-1">
              Članovi ({community.membersCount.toLocaleString("sr-RS")})
            </span>
            {isMod && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] text-text-2 bg-surface cursor-pointer hover:bg-accent-soft hover:text-accent hover:border-accent transition-colors"
              >
                <UserPlus size={13} strokeWidth={2} />
                Pozovi
              </button>
            )}
          </div>
          {!members?.length ? (
            <div className="text-center py-10 text-text-3 text-[13px]">
              Nema članova
            </div>
          ) : (
            members.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0 hover:bg-surface-2-2 transition-colors"
              >
                <div
                  onClick={() => navigate(`/u/${m.user?.username}`)}
                  className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0 cursor-pointer hover:opacity-80"
                >
                  {m.user?.avatar ? (
                    <img
                      src={m.user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    m.user?.username?.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div
                    onClick={() => navigate(`/u/${m.user?.username}`)}
                    className="text-[13px] font-medium text-text-1 cursor-pointer hover:text-accent transition-colors"
                  >
                    {m.user?.username}
                  </div>
                  <div className="text-[11px] text-text-3">
                    {ROLE_SR[m.role] ?? m.role}
                  </div>
                </div>
                <div className="text-[11px] text-text-3 mr-2">
                  {new Date(m.joinedAt).toLocaleDateString("sr-RS")}
                </div>
                {/* Promote/demote — samo vlasnik, ne može da menja sebe ni drugog vlasnika */}
                {isOwner && m.userId !== user?.id && m.role !== "owner" && (
                  <>
                  <button
                    onClick={() =>
                      roleMutation.mutate({
                        userId: m.userId,
                        role: m.role === "moderator" ? "member" : "moderator",
                      })
                    }
                    disabled={roleMutation.isPending}
                    title={
                      m.role === "moderator"
                        ? "Ukloni moderatora"
                        : "Postavi za moderatora"
                    }
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 ${
                      m.role === "moderator"
                        ? "border-warning/30 bg-warning-soft text-warning hover:bg-red-50"
                        : "border-accent/30 bg-accent-soft text-accent hover:bg-accent hover:text-white"
                    }`}
                  >
                    {m.role === "moderator" ? (
                      <ShieldOff size={14} strokeWidth={2} />
                    ) : (
                      <ShieldCheck size={14} strokeWidth={2} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Kickovati ${m.user?.username}?`))
                        kickMutation.mutate(m.userId);
                    }}
                    disabled={kickMutation.isPending}
                    title="Kick člana"
                    className="w-8 h-8 rounded-lg border border-orange-300/50 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <UserX size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Banovati ${m.user?.username}? Korisnik neće moći da se ponovo pridruži.`))
                        banMutation.mutate(m.userId);
                    }}
                    disabled={banMutation.isPending}
                    title="Ban člana"
                    className="w-8 h-8 rounded-lg border border-red-300/50 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Ban size={14} strokeWidth={2} />
                  </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Gallery tab */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          {isMember && (
            <div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryUploadViaApi}
                className="hidden"
              />
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50 shadow-[0_2px_8px_rgba(26,138,87,0.3)]"
              >
                <ImagePlus size={15} strokeWidth={2.5} />
                {galleryUploading ? "Učitavam..." : "Dodaj sliku"}
              </button>
              {!isMod && (
                <p className="text-[11px] text-text-3 mt-1.5">
                  Slike čekaju odobrenje moderatora pre prikazivanja.
                </p>
              )}
            </div>
          )}

          {/* Pending approval — samo za mod/owner */}
          {isMod && (pendingGallery?.length ?? 0) > 0 && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="px-5 py-3.5 border-b border-surface-2 flex items-center gap-2">
                <span className="font-semibold text-[14px] text-text-1">
                  Na čekanju
                </span>
                <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[11px] font-bold">
                  {pendingGallery!.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                {pendingGallery!.map((img: any) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden border border-border relative group"
                  >
                    <div className="aspect-square">
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-70"
                      />
                    </div>
                    <div className="p-2 bg-surface-2 border-t border-border">
                      <div className="text-[11px] text-text-3 truncate mb-1.5">
                        od {img.uploadedBy?.username}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => approveImageMutation.mutate(img.id)}
                          disabled={approveImageMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-accent text-white text-[11px] font-semibold border-none cursor-pointer disabled:opacity-50"
                        >
                          <Check size={11} strokeWidth={3} /> Odobri
                        </button>
                        <button
                          onClick={() => rejectImageMutation.mutate(img.id)}
                          disabled={rejectImageMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-danger-soft text-danger text-[11px] font-semibold border-none cursor-pointer disabled:opacity-50"
                        >
                          <X size={11} strokeWidth={3} /> Odbij
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved gallery */}
          {!gallery?.length ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <div className="text-[40px] mb-3">🖼️</div>
              <div className="font-serif text-[15px] text-text-1 mb-1">
                Galerija je prazna
              </div>
              <div className="text-[13px] text-text-3">
                {isMember ? "Dodaj prvu sliku!" : "Nema slika još."}
              </div>
            </div>
          ) : (
            <>
              {lightboxIndex !== null && (
                <ImageLightbox
                  images={gallery.map((img: any) => ({
                    src: img.imageUrl,
                    caption: img.uploadedBy?.username
                      ? `📸 ${img.uploadedBy.username}`
                      : undefined,
                  }))}
                  index={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                  onPrev={() =>
                    setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))
                  }
                  onNext={() =>
                    setLightboxIndex((i) =>
                      Math.min(gallery.length - 1, (i ?? 0) + 1),
                    )
                  }
                />
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((img: any, i: number) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-square rounded-xl overflow-hidden border border-border group relative cursor-pointer"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title ?? ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {img.uploadedBy?.username && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-[11px] text-white truncate">
                          {img.uploadedBy.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* About tab */}
      {activeTab === "about" && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="font-serif text-[18px] text-text-1 mb-4">
            O zajednici
          </div>
          {community.description ? (
            <p className="text-[14px] text-text-2 leading-relaxed mb-5">
              {community.description}
            </p>
          ) : (
            <p className="text-[13px] text-text-3 italic mb-5">
              Nema opisa zajednice.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-2">
            <div>
              <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">
                Title
              </div>
              <div className="text-[13px] text-text-1 font-medium">
                {community.name}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">
                Kategorija
              </div>
              <div className="text-[13px] text-text-1 font-medium">
                {CATEGORY_SR[community.category] ?? community.category}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">
                Tip
              </div>
              <div className="text-[13px] text-text-1 font-medium">
                {TYPE_SR[community.type]}
              </div>
            </div>
            {community.location && (
              <div>
                <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">
                  Lokacija
                </div>
                <div className="text-[13px] text-text-1 font-medium">
                  📍 {community.location}
                </div>
              </div>
            )}
            <div>
              <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">
                Kreirana
              </div>
              <div className="text-[13px] text-text-1 font-medium">
                {new Date(community.createdAt).toLocaleDateString("sr-RS")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal — prenos vlasništva pre napuštanja */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-serif text-[18px] text-text-1 mb-1">Napusti zajednicu</h2>
            <p className="text-[13px] text-text-2 mb-5">
              Kao vlasnik, moraš preneti vlasništvo na drugog člana pre nego što napustiš zajednicu.
            </p>

            <label className="text-[12px] font-medium text-text-2 mb-2 block">
              Odaberi novog vlasnika
            </label>
            <select
              value={selectedNewOwner}
              onChange={(e) => setSelectedNewOwner(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text-1 text-[13px] mb-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">-- Odaberi člana --</option>
              {(members as any[])
                ?.filter((m: any) => m.userId !== user?.id)
                .map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.displayName || m.user?.username}
                    {m.role === "moderator" ? " (moderator)" : ""}
                  </option>
                ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  setSelectedNewOwner("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-1 text-[13px] font-medium cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Otkaži
              </button>
              <button
                onClick={() => leaveMutation.mutate(selectedNewOwner)}
                disabled={!selectedNewOwner || leaveMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {leaveMutation.isPending ? "Čekaj..." : "Prenesi i napusti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
