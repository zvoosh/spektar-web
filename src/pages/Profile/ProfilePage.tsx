import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { uploadApi } from "@/api/upload";
import { useAuthStore } from "@/store/authStore";
import PostCard from "@/pages/Feed/PostCard";
import { postsApi } from "@/api/posts";
import { FileText, Bookmark, Camera, ImagePlus, Users } from "lucide-react";
import { friendsApi } from "@/api/friends";

type Tab = "posts" | "saved" | "friends";

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(authUser?.bio ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const acceptMutation = useMutation({
    mutationFn: (requesterId: string) => friendsApi.accept(requesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      refetchPending();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requesterId: string) => friendsApi.reject(requesterId),
    onSuccess: () => refetchPending(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { bio?: string; avatar?: string; banner?: string }) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    },
  });

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      await updateMutation.mutateAsync({ banner: url });
    } finally {
      setBannerUploading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      await updateMutation.mutateAsync({ avatar: url });
    } finally {
      setAvatarUploading(false);
    }
  };

  const user = profile ?? authUser;
  if (!user) return null;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("sr-RS", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile card */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Banner */}
        <div className="relative h-32 group overflow-hidden">
          {user?.banner ? (
            <img src={user.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0d4f2e] via-[#1a8a57] to-[#3ab878]" />
          )}
          {bannerUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-surface border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-[12px] border border-white/20 cursor-pointer backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
          >
            <ImagePlus size={13} />
            Promeni baner
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-accent-soft border-4 border-surface flex items-center justify-center text-xl font-bold text-accent cursor-pointer overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username.slice(0, 2).toUpperCase()
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-accent border-2 border-surface flex items-center justify-center cursor-pointer pointer-events-none">
                <Camera size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <button
              onClick={() => { setEditing(!editing); setBio(user.bio ?? ""); }}
              className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-text-2 bg-surface cursor-pointer hover:bg-surface-2-2 transition-colors"
            >
              {editing ? "Otkaži" : "Uredi profil"}
            </button>
          </div>

          {/* Name + info */}
          <div className="mb-3">
            <h1 className="font-serif text-[20px] text-text-1 leading-tight">{user.username}</h1>
            <div className="text-[12px] text-text-3 mt-0.5">{user.email}</div>
          </div>

          {/* Bio */}
          {!editing && (
            <p className="text-[13px] text-text-2 leading-relaxed mb-4">
              {user.bio || <span className="italic text-text-3">Nema opisa. Klikni "Uredi profil".</span>}
            </p>
          )}

          {editing && (
            <div className="mb-4 space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Napiši nešto o sebi..."
                rows={3}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-2 leading-relaxed outline-none focus:border-accent resize-none font-sans bg-surface"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-3">{bio.length}/300</span>
                <button
                  onClick={() => updateMutation.mutate({ bio })}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Čuvam..." : "Sačuvaj"}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-surface-2">
            <div>
              <div className="text-[18px] font-bold text-text-1">{myPosts?.length ?? 0}</div>
              <div className="text-[11px] text-text-3 font-medium">postova</div>
            </div>
            <div
              onClick={() => setActiveTab("friends")}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="text-[18px] font-bold text-text-1">{friends?.length ?? 0}</div>
              <div className="text-[11px] text-text-3 font-medium">prijatelja</div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-accent">{user.karma}</div>
              <div className="text-[11px] text-text-3 font-medium">karma</div>
            </div>
            <div className="sm:ml-auto text-[11px] sm:text-[12px] text-text-3">Član od {joinedDate}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border bg-surface rounded-t-xl px-0 sm:px-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-x-auto scrollbar-hide">
        {([
          { value: "posts", label: "Moji postovi", icon: FileText, count: myPosts?.length },
          { value: "saved", label: "Sačuvano", icon: Bookmark, count: savedPosts?.length },
          { value: "friends", label: "Prijatelji", icon: Users, count: friends?.length },
        ] as const).map(({ value, label, icon: Icon, count }) => (
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
            {count != null && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === value ? "bg-accent text-white" : "bg-surface-2 text-text-3"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <>
          {postsLoading && (
            <div className="text-center py-10 text-text-3 text-[13px]">Učitavam...</div>
          )}
          {!postsLoading && myPosts?.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <div className="text-[40px] mb-3">📝</div>
              <div className="font-serif text-[15px] text-text-1 mb-1">Nema objavljenih postova</div>
              <div className="text-[13px] text-text-3">Tvoji postovi će se ovde pojaviti.</div>
            </div>
          )}
          {myPosts?.map((post) => <PostCard key={post.id} post={post} />)}
        </>
      )}

      {/* Saved tab */}
      {activeTab === "saved" && (
        <>
          {savedLoading && (
            <div className="text-center py-10 text-text-3 text-[13px]">Učitavam...</div>
          )}
          {!savedLoading && savedPosts?.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <div className="text-[40px] mb-3">🔖</div>
              <div className="font-serif text-[15px] text-text-1 mb-1">Nema sačuvanih postova</div>
              <div className="text-[13px] text-text-3">Klikni 🔖 na postu da ga sačuvaš.</div>
            </div>
          )}
          {savedPosts?.map((post) => <PostCard key={post.id} post={post} />)}
        </>
      )}

      {/* Friends tab */}
      {activeTab === "friends" && (
        <div className="space-y-4">
          {/* Pending requests */}
          {(pendingRequests?.length ?? 0) > 0 && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="px-5 py-3.5 border-b border-surface-2">
                <span className="font-semibold text-[13px] text-text-1">
                  Zahtevi za prijateljstvo
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">
                    {pendingRequests!.length}
                  </span>
                </span>
              </div>
              {pendingRequests!.map((req) => (
                <div key={req.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0">
                  <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0">
                    {req.requester?.avatar
                      ? <img src={req.requester.avatar} alt="" className="w-full h-full object-cover" />
                      : req.requester?.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text-1">{req.requester?.username}</div>
                    <div className="text-[11px] text-text-3">želi da te doda kao prijatelja</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => acceptMutation.mutate(req.requesterId)}
                      className="px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-accent-hover"
                    >
                      Prihvati
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(req.requesterId)}
                      className="px-3 py-1.5 rounded-lg border border-border text-text-2 text-[12px] bg-surface cursor-pointer hover:bg-surface-2-2"
                    >
                      Odbij
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-3.5 border-b border-surface-2">
              <span className="font-semibold text-[13px] text-text-1">
                Prijatelji ({friends?.length ?? 0})
              </span>
            </div>
            {!friends?.length ? (
              <div className="text-center py-10">
                <div className="text-[36px] mb-2">👋</div>
                <div className="font-serif text-[14px] text-text-1 mb-1">Nema prijatelja još</div>
                <div className="text-[12px] text-text-3">Pronađi ljude kroz pretragu</div>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0 hover:bg-surface-2-2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0">
                    {friend.avatar
                      ? <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                      : friend.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text-1">{friend.username}</div>
                    {friend.bio && <div className="text-[11px] text-text-3 truncate">{friend.bio}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
