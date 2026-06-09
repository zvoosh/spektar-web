import { memo, useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postsApi } from "@/api/posts";
import { MessageSquare, Bookmark, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import ShareMenu from "@/components/shared/ShareMenu";
import type { Post } from "@/types";

interface Props {
  post: Post;
  votes: number;
  userVote: "up" | "down" | null;
  isSaved: boolean;
  isMobile: boolean;
  isAuthenticated: boolean;
  isOwn: boolean;
  onVote: (type: "up" | "down") => void;
  onSave: () => void;
}

const PostCardFooter = memo(({
  post,
  votes,
  userVote,
  isSaved,
  isMobile,
  isAuthenticated,
  isOwn,
  onVote,
  onSave,
}: Props) => {

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const requireAuth = () =>
    navigate("/login", { state: { from: location, background: location } });

  return (
    <div className="flex items-center pt-3 border-t border-surface-2 gap-1 flex-wrap">
      {/* Vote */}
      <div className="flex items-center bg-surface-2 rounded-lg overflow-hidden">
        <button
          onClick={() => isAuthenticated ? onVote("up") : requireAuth()}
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
          onClick={() => isAuthenticated ? onVote("down") : requireAuth()}
          className={`px-2 py-1.5 border-none cursor-pointer transition-all ${
            userVote === "down"
              ? "bg-blue-500 text-white"
              : "bg-transparent text-text-3 hover:text-blue hover:bg-blue-soft"
          }`}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Comments */}
      <button
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] text-text-3 hover:text-text-1 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer transition-all font-medium"
      >
        <MessageSquare size={14} strokeWidth={2} />
        {!isMobile && <span>{post.commentsCount}</span>}
        {isMobile && post.commentsCount > 0 && <span>{post.commentsCount}</span>}
      </button>

      {/* Save */}
      <button
        onClick={() => isAuthenticated ? onSave() : requireAuth()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] border-none cursor-pointer transition-all font-medium ${
          isSaved
            ? "text-accent bg-accent-soft"
            : "text-text-3 hover:text-text-1 hover:bg-surface-2-2 bg-transparent"
        }`}
      >
        <Bookmark size={14} strokeWidth={2} fill={isSaved ? "currentColor" : "none"} />
        {!isMobile && <span>{isSaved ? "Sačuvano" : "Sačuvaj"}</span>}
      </button>

      {/* Share */}
      <ShareMenu
        url={`${window.location.origin}/post/${post.id}`}
        title={post.title}
        text={post.content?.slice(0, 100)}
        onShare={() => postsApi.share(post.id)}
        showLabel={!isMobile}
      />

      {/* More menu */}
      <div className="ml-auto relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="w-7 h-7 rounded-lg border border-border bg-surface text-text-3 cursor-pointer flex items-center justify-center hover:bg-surface-2-2 transition-colors"
        >
          <MoreHorizontal size={14} strokeWidth={2} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 bottom-full mb-1 w-40 bg-surface border border-border rounded-xl shadow-lg py-1 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer"
            >
              Otvori post
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                postsApi.share(post.id);
                navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 bg-transparent border-none cursor-pointer"
            >
              Kopiraj link
            </button>
            {isOwn && (
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
  );
};

});

export default PostCardFooter;
