import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { usersApi } from "@/api/users";
import { postsApi } from "@/api/posts";
import { friendsApi } from "@/api/friends";
import { chatApi } from "@/api/chat";
import { useAuthStore } from "@/store/authStore";
import PostCard from "@/pages/Feed/PostCard";
import FriendButton from "@/components/shared/FriendButton";
import { MessageCircle, ArrowLeft, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const location = useLocation();
  const { user: me, isAuthenticated } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => usersApi.getByUsername(username!),
    enabled: !!username,
  });

  const { data: posts } = useQuery({
    queryKey: ["posts", "by-user", user?.id],
    queryFn: () => postsApi.getByUser(user!.id),
    enabled: !!user?.id,
  });

  const { data: friendCount } = useQuery({
    queryKey: ["friend-count", user?.id],
    queryFn: () => friendsApi.getFriendCount(user!.id),
    enabled: !!user?.id,
  });

  const { data: friendStatus } = useQuery({
    queryKey: ["friend-status", user?.id],
    queryFn: () => friendsApi.getStatus(user!.id),
    enabled: !!user?.id && isAuthenticated,
  });

  const isFriend = friendStatus?.status === "accepted";

  const dmMutation = useMutation({
    mutationFn: () => chatApi.createDM(user!.id),
    onSuccess: () => { if (mountedRef.current) navigate("/chat"); },
  });

  const isOwnProfile = me?.id === user?.id;

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-20 text-text-3">
        Učitavam profil...
      </div>
    );

  if (!user)
    return (
      <div className="text-center p-20">
        <div className="text-[32px] mb-3">🔍</div>
        <div className="font-serif text-[15px] text-text-1">
          Korisnik nije pronađen
        </div>
      </div>
    );

  if (isOwnProfile) {
    navigate("/profile", { replace: true });
    return null;
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("sr-RS", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-text-3 bg-transparent border-none cursor-pointer mb-4 hover:text-text-1 transition-colors"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Nazad
      </button>

      {/* Profile card */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Banner */}
        <div className="h-32 overflow-hidden">
          {user.banner ? (
            <img
              src={user.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0d4f2e] via-[#1a8a57] to-[#3ab878]" />
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-accent-soft border-4 border-surface flex items-center justify-center text-xl font-bold text-accent overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 relative left-2 sm:top-3 sm:left-0">
              {isAuthenticated ? (
                <>
                  {isFriend && (
                    <button
                      onClick={() => dmMutation.mutate()}
                      disabled={dmMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-text-1 bg-surface cursor-pointer hover:bg-surface-2 hover:border-border-strong transition-all disabled:opacity-50 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    >
                      <MessageCircle
                        size={15}
                        strokeWidth={2}
                        className="text-text-3"
                      />
                      Poruka
                    </button>
                  )}
                  <FriendButton userId={user.id} />
                </>
              ) : (
                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { from: location, background: location },
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-accent-hover transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.35)]"
                >
                  <UserPlus size={15} strokeWidth={2.5} />
                  Dodaj prijatelja
                </button>
              )}
            </div>
          </div>

          <h1 className="font-serif text-[20px] text-text-1 leading-tight">
            {user.displayName || user.username}
          </h1>
          <div className="text-[12px] text-text-3 mt-0.5 mb-3">
            {user.displayName && <span className="mr-2">@{user.username}</span>}
            Član od {joinedDate}
          </div>

          {user.location && (
            <div className="flex items-center gap-1.5 text-[12px] text-text-3 mb-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {user.location}
            </div>
          )}

          {user.bio && (
            <p className="text-[13px] text-text-2 leading-relaxed mb-4">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 pt-3 border-t border-surface-2">
            <div>
              <div className="text-[18px] font-bold text-text-1">
                {posts?.length ?? 0}
              </div>
              <div className="text-[11px] text-text-3 font-medium">postova</div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-text-1">
                {friendCount ?? 0}
              </div>
              <div className="text-[11px] text-text-3 font-medium">
                prijatelja
              </div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-accent">
                {user.karma}
              </div>
              <div className="text-[11px] text-text-3 font-medium">karma</div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {(posts?.length ?? 0) > 0 && (
        <div>
          <div className="font-semibold text-[14px] text-text-1 mb-3">
            Postovi
          </div>
          {posts!.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {posts?.length === 0 && (
        <div className="text-center py-10 bg-surface rounded-2xl border border-border">
          <div className="text-[36px] mb-2">📝</div>
          <div className="text-[14px] text-text-3">
            Nema objavljenih postova
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
