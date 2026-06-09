import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postsApi } from "@/api/posts";
import type { Post } from "@/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthStore } from "@/store/authStore";
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  MapPin,
  CalendarDays,
} from "lucide-react";
import ShareMenu from "@/components/shared/ShareMenu";

const POST_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  announcement: {
    label: "Obaveštenje",
    color: "#c4622d",
    bg: "#fdf3ee",
    dot: "#e8845a",
  },
  discussion: {
    label: "Diskusija",
    color: "#2d5fa8",
    bg: "#eef3fc",
    dot: "#5b8ad6",
  },
  event: { label: "Događaj", color: "#1a8a57", bg: "#e8f8f0", dot: "#3ab878" },
  recommendation: {
    label: "Preporuka",
    color: "#7c5c1e",
    bg: "#fdf6e8",
    dot: "#c49a3c",
  },
  photo: {
    label: "Fotografija",
    color: "#6b2d7a",
    bg: "#f5eaf8",
    dot: "#a055b8",
  },
  question: {
    label: "Pitanje",
    color: "#2d5fa8",
    bg: "#eef3fc",
    dot: "#5b8ad6",
  },
};

const formatDate = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

const PostCard = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const [votes, setVotes] = useState(post.votesCount);
  const [userVote, setUserVote] = useState(post.userVote);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.delete(post.id),
    onSuccess: () => {
      toast.success("Post je obrisan");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "by-user"] });
    },
    onError: () => toast.error("Brisanje nije uspelo"),
  });

  const cfg = POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.discussion;

  const voteMutation = useMutation({
    mutationFn: (type: "up" | "down") => postsApi.vote(post.id, type),
    onMutate: (type) => {
      const prevVotes = votes;
      const prevUserVote = userVote;
      if (userVote === type) {
        setUserVote(null);
        setVotes((v) => v + (type === "up" ? -1 : 1));
      } else if (userVote === null) {
        setUserVote(type);
        setVotes((v) => v + (type === "up" ? 1 : -1));
      } else {
        setUserVote(type);
        setVotes((v) => v + (type === "up" ? 2 : -2));
      }
      return { prevVotes, prevUserVote };
    },
    onSuccess: (data) => {
      setVotes(data.votesCount);
    },
    onError: (_, __, context) => {
      if (context) {
        setVotes(context.prevVotes);
        setUserVote(context.prevUserVote);
      }
      toast.error("Glasanje nije uspelo");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => postsApi.toggleSave(post.id),
    onMutate: () => {
      const prev = isSaved;
      setIsSaved(!isSaved);
      return { prev };
    },
    onSuccess: (data) => setIsSaved(data.isSaved),
    onError: (_, __, context) => {
      if (context) setIsSaved(context.prev);
      toast.error("Nije uspelo");
    },
  });

  return (
    <div className="bg-surface border border-border rounded-2xl mb-3 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px group">
      <div className={isMobile ? "px-4 py-3.5" : "px-5 py-4"}>
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent/20 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 overflow-hidden">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              (post.author?.displayName || post.author?.username)?.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/u/${post.author?.username}`);
                }}
                className="text-[12.5px] font-semibold text-text-1 cursor-pointer hover:text-accent transition-colors"
              >
                {post.author?.displayName || post.author?.username}
              </span>
              <span className="text-[11px] text-text-3">u</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/c/${post.community?.slug}`);
                }}
                className="text-[12.5px] font-semibold text-accent cursor-pointer hover:underline"
              >
                {post.community?.name}
              </span>
              <span className="text-[11px] text-text-3">
                · {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
          {/* Type badge */}
          <span
            className="text-[10.5px] font-semibold py-0.5 px-2.5 rounded-full shrink-0 flex items-center gap-1"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: cfg.dot }}
            />
            {cfg.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex gap-3.5 items-start">
          <div className="flex-1 min-w-0">
            <div
              onClick={() => navigate(`/post/${post.id}`)}
              className={`font-serif leading-snug text-text-1 mb-1.5 cursor-pointer group-hover:text-accent transition-colors duration-150 ${
                isMobile ? "text-[15px]" : "text-[17px]"
              }`}
            >
              {post.title}
            </div>

            {post.body && (
              <p className="text-[13px] text-text-2 leading-relaxed mb-2.5 line-clamp-2">
                {post.body}
              </p>
            )}

            {(post.type === "event" && post.eventDate || post.eventLocation) && (
              <div className="flex gap-3 mb-2.5 flex-wrap">
                {post.type === "event" && post.eventDate && (
                  <span className="flex items-center gap-1.5 text-[12px] text-accent font-medium bg-accent-soft px-2.5 py-1 rounded-lg">
                    <CalendarDays size={12} strokeWidth={2.5} />
                    {new Date(post.eventDate).toLocaleDateString("sr-RS")}
                  </span>
                )}
                {post.eventLocation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.eventLocation!)}`,
                        "_blank"
                      );
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-text-2 bg-surface-2 hover:bg-accent-soft hover:text-accent px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors"
                    title="Otvori na Google Maps"
                  >
                    <MapPin size={12} strokeWidth={2.5} />
                    {post.eventLocation}
                  </button>
                )}
              </div>
            )}

            {post.tags?.filter((t) => t.trim()).length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {post.tags
                  .filter((t) => t.trim())
                  .map((t) => (
                    <span
                      key={t}
                      onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(t.trim())}`); }}
                      className="text-[11px] py-0.5 px-2 rounded-md bg-surface-2 text-text-3 hover:bg-accent-soft hover:text-accent cursor-pointer transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {post.imageUrl && (
            <>
              <img
                src={post.imageUrl}
                alt={post.title}
                onClick={() => navigate(`/post/${post.id}`)}
                className={`rounded-xl object-cover shrink-0 cursor-pointer hover:opacity-95 transition-opacity ${
                  isMobile ? "w-20 h-16" : "w-32 h-24"
                }`}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center pt-3 border-t border-surface-2 gap-1 flex-wrap">
          {/* Vote */}
          <div className="flex items-center bg-surface-2 rounded-lg overflow-hidden">
            <button
              onClick={() => isAuthenticated ? voteMutation.mutate("up") : navigate("/login", { state: { from: location, background: location } })}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold border-none cursor-pointer transition-all ${
                userVote === "up"
                  ? "bg-accent text-white"
                  : "bg-transparent text-text-3 hover:text-accent hover:bg-accent-soft"
              }`}
            >
              <ChevronUp size={14} strokeWidth={2.5} />
              <span>{votes}</span>
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => isAuthenticated ? voteMutation.mutate("down") : navigate("/login", { state: { from: location, background: location } })}
              className={`px-2 py-1.5 border-none cursor-pointer transition-all ${
                userVote === "down"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-text-3 hover:text-blue hover:bg-blue-soft"
              }`}
            >
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>
          </div>

          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] text-text-3 hover:text-text-1 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer transition-all font-medium"
          >
            <MessageSquare size={14} strokeWidth={2} />
            {!isMobile && <span>{post.commentsCount}</span>}
            {isMobile && post.commentsCount > 0 && (
              <span>{post.commentsCount}</span>
            )}
          </button>

          <button
            onClick={() => isAuthenticated ? saveMutation.mutate() : navigate("/login", { state: { from: location, background: location } })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] border-none cursor-pointer transition-all font-medium ${
              isSaved
                ? "text-accent bg-accent-soft"
                : "text-text-3 hover:text-text-1 hover:bg-surface-2-2 bg-transparent"
            }`}
          >
            <Bookmark
              size={14}
              strokeWidth={2}
              fill={isSaved ? "currentColor" : "none"}
            />
            {!isMobile && <span>{isSaved ? "Sačuvano" : "Sačuvaj"}</span>}
          </button>

          <ShareMenu
            url={`${window.location.origin}/post/${post.id}`}
            title={post.title}
            text={post.content?.slice(0, 100)}
            onShare={() => postsApi.share(post.id)}
            showLabel={!isMobile}
          />

          <div className="ml-auto relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="w-7 h-7 rounded-lg border border-border bg-surface text-text-3 cursor-pointer flex items-center justify-center hover:bg-surface-2-2 transition-colors"
            >
              <MoreHorizontal size={14} strokeWidth={2} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-surface border border-border rounded-xl shadow-lg py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/post/${post.id}`);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer"
                >
                  Otvori post
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    postsApi.share(post.id);
                    navigator.clipboard?.writeText(
                      `${window.location.origin}/post/${post.id}`,
                    );
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer"
                >
                  Kopiraj link
                </button>
                {user?.id === post.authorId && (
                  <>
                    <div className="my-1 mx-3 border-t border-surface-2" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (!confirm("Obrisati ovaj post?")) return;
                        deleteMutation.mutate();
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-danger hover:bg-danger-soft bg-transparent border-none cursor-pointer"
                    >
                      🗑 Obriši post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
