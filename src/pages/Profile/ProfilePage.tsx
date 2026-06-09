import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { postsApi } from "@/api/posts";
import { friendsApi } from "@/api/friends";
import { FileText, Bookmark, Users } from "lucide-react";

import ProfileHeader from "./ProfileHeader";
import ProfilePostsTab from "./ProfilePostsTab";
import ProfileSavedTab from "./ProfileSavedTab";
import ProfileFriendsTab from "./ProfileFriendsTab";
import PageMeta from "@/components/shared/PageMeta";

type Tab = "posts" | "saved" | "friends";

const TABS = [
  { value: "posts"   as const, label: "Moji postovi", icon: FileText },
  { value: "saved"   as const, label: "Sačuvano",     icon: Bookmark },
  { value: "friends" as const, label: "Prijatelji",   icon: Users    },
];

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  // ─── Queries ──────────────────────────────────────────────────────────────────

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: usersApi.getMe,
  });

  const { data: myPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "by-user", authUser?.id],
    queryFn: () => postsApi.getByUser(authUser!.id),
    enabled: !!authUser?.id,
  });

  const { data: savedPosts, isLoading: savedLoading } = useQuery({
    queryKey: ["posts", "saved"],
    queryFn: postsApi.getSaved,
  });

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: friendsApi.getFriends,
    enabled: activeTab === "friends",
  });

  const { data: pendingRequests, refetch: refetchPending } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: friendsApi.getPendingRequests,
    enabled: activeTab === "friends",
  });

  // ─── Mutations ────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: { bio?: string; avatar?: string; banner?: string }) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      toast.success("Profil je ažuriran");
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Ažuriranje profila nije uspelo"),
  });

  const acceptMutation = useMutation({
    mutationFn: (requesterId: string) => friendsApi.accept(requesterId),
    onSuccess: () => {
      toast.success("Zahtev je prihvaćen");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      refetchPending();
    },
    onError: () => toast.error("Prihvatanje nije uspelo"),
  });

  const rejectMutation = useMutation({
    mutationFn: (requesterId: string) => friendsApi.reject(requesterId),
    onSuccess: () => {
      toast.success("Zahtev je odbijen");
      refetchPending();
    },
    onError: () => toast.error("Odbijanje nije uspelo"),
  });

  // ─── Stable handlers ──────────────────────────────────────────────────────────

  const handleUpdateProfile = useCallback(
    (data: { bio?: string; avatar?: string; banner?: string }) =>
      updateMutation.mutateAsync(data),
    [updateMutation]
  );

  const handleAccept = useCallback((id: string) => acceptMutation.mutate(id), [acceptMutation]);
  const handleReject = useCallback((id: string) => rejectMutation.mutate(id), [rejectMutation]);
  const handleFriendsClick = useCallback(() => setActiveTab("friends"), []);

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const user = profile ?? authUser;

  const joinedDate = useMemo(
    () => user ? new Date(user.createdAt).toLocaleDateString("sr-RS", { year: "numeric", month: "long" }) : "",
    [user?.createdAt]
  );

  if (!user) return null;

  const tabCounts: Record<Tab, number | undefined> = {
    posts:   myPosts?.length,
    saved:   savedPosts?.length,
    friends: friends?.length,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageMeta
        title={user.displayName || user.username}
        description={user.bio ?? `Profil korisnika ${user.username} na Spektru Beograda.`}
        image={user.avatar ?? undefined}
        path={`/u/${user.username}`}
      />
      <ProfileHeader
        user={user}
        myPostsCount={myPosts?.length ?? 0}
        friendsCount={friends?.length ?? 0}
        joinedDate={joinedDate}
        onUpdateProfile={handleUpdateProfile}
        isSaving={updateMutation.isPending}
        onFriendsClick={handleFriendsClick}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border bg-surface rounded-t-xl px-0 sm:px-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-x-auto scrollbar-hide">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex items-center gap-1.5 px-1 sm:px-4 py-3 text-[12px] sm:text-[13px] font-medium border-none bg-transparent cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              activeTab === value
                ? "border-accent text-accent"
                : "border-transparent text-text-3 hover:text-text-1"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
            {tabCounts[value] != null && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === value ? "bg-accent text-white" : "bg-surface-2 text-text-3"}`}>
                {tabCounts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts"   && <ProfilePostsTab   posts={myPosts}    isLoading={postsLoading} />}
      {activeTab === "saved"   && <ProfileSavedTab   posts={savedPosts} isLoading={savedLoading} />}
      {activeTab === "friends" && (
        <ProfileFriendsTab
          friends={friends}
          pendingRequests={pendingRequests}
          onAccept={handleAccept}
          onReject={handleReject}
          acceptPending={acceptMutation.isPending}
          rejectPending={rejectMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProfilePage;
