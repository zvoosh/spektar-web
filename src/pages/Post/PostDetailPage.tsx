import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { useAuthStore } from "@/store/authStore";
import type { Comment } from "@/types";
import ImageLightbox from "@/components/shared/ImageLightbox";
import ShareMenu from "@/components/shared/ShareMenu";

const POST_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  announcement: { label: "OBAVEŠTENJE", color: "#C4622D", bg: "#F0E6DE" },
  discussion: { label: "DISKUSIJA", color: "#2D5FA8", bg: "#E3EAF5" },
  event: { label: "DOGAĐAJ", color: "#2D7A4F", bg: "#E3F0E9" },
  recommendation: { label: "PREPORUKA", color: "#6B5A2D", bg: "#F5EFE0" },
  photo: { label: "FOTOGRAFIJA", color: "#6B2D7A", bg: "#F0E3F5" },
  question: { label: "PITANJE", color: "#2D5FA8", bg: "#E3EAF5" },
};

const formatDate = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `pre ${mins}m`;
  if (hours < 24) return `pre ${hours}h`;
  return `pre ${days}d`;
};

const CommentItem = ({
  comment,
  postId,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  depth?: number;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const replyMutation = useMutation({
    mutationFn: () =>
      postsApi.createComment(postId, { body: replyBody, parentId: comment.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyBody("");
      setShowReply(false);
    },
  });

  return (
    <div className={depth > 0 ? "ml-8 mt-3" : "mt-4"}>
      <div className="flex gap-3">
        <div
          onClick={() => comment.user?.username && navigate(`/u/${comment.user.username}`)}
          className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent shrink-0 overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
        >
          {comment.user?.avatar
            ? <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
            : (comment.user?.displayName || comment.user?.username)?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              onClick={() => comment.user?.username && navigate(`/u/${comment.user.username}`)}
              className="text-[13px] font-semibold text-text-1 cursor-pointer hover:text-accent transition-colors"
            >
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="text-[11px] text-text-3">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-[10px] text-text-3">(izmenjeno)</span>
            )}
          </div>
          <div className="text-[13px] text-text-2 leading-relaxed">{comment.body}</div>
          <div className="flex items-center gap-3 mt-2">
            <button className="text-[11px] text-text-3 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-accent">
              ▲ {comment.votesCount}
            </button>
            {depth < 2 && user && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[11px] text-text-3 bg-transparent border-none cursor-pointer hover:text-accent"
              >
                Odgovori
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Napiši odgovor..."
                className="flex-1 px-3 py-2 rounded-lg border border-border text-[13px] outline-none focus:border-accent bg-surface"
              />
              <button
                onClick={() => replyMutation.mutate()}
                disabled={!replyBody.trim() || replyMutation.isPending}
                className="px-3 py-2 rounded-lg bg-accent text-white text-[13px] border-none cursor-pointer disabled:opacity-50"
              >
                Pošalji
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}
    </div>
  );
};

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentBody, setCommentBody] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [votes, setVotes] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<"up" | "down" | null | undefined>(undefined);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => postsApi.getComments(id!),
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: (type: "up" | "down") => postsApi.vote(id!, type),
    onSuccess: (data, type) => {
      setVotes(data.votesCount);
      setUserVote((prev) => (prev === type ? null : type));
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => postsApi.createComment(id!, { body: commentBody }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentBody("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-text-3">
        Učitavam post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center p-20">
        <div className="text-[32px] mb-3">🔍</div>
        <div className="font-serif text-[15px] text-text-1">Post nije pronađen</div>
      </div>
    );
  }

  const currentVotes = votes ?? post.votesCount;
  const currentUserVote = userVote === undefined ? post.userVote : userVote;
  const typeConfig = POST_TYPE_LABELS[post.type] || POST_TYPE_LABELS.discussion;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-text-3 bg-transparent border-none cursor-pointer mb-4 hover:text-text-1"
      >
        ← Nazad
      </button>

      {/* Post */}
      <div className="bg-surface border border-border rounded-[14px] p-6 mb-4">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-4">
          <div
            onClick={() => post.author?.username && navigate(`/u/${post.author.username}`)}
            className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent shrink-0 overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
          >
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
              : (post.author?.displayName || post.author?.username)?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => navigate(`/u/${post.author?.username}`)}
                className="text-[13px] font-medium text-text-1 cursor-pointer hover:text-accent transition-colors"
              >
                {post.author?.displayName || post.author?.username}
              </span>
              <span className="text-xs text-text-3">u</span>
              <span
                onClick={() => navigate(`/c/${post.community?.slug}`)}
                className="text-xs font-medium text-accent cursor-pointer"
              >
                {post.community?.name}
              </span>
              <span className="text-[11px] text-border-strong">
                · {formatDate(post.createdAt)}
              </span>
              {post.isEdited && (
                <span className="text-[11px] text-text-3">(izmenjeno)</span>
              )}
            </div>
          </div>
          <span
            className="text-[10px] font-semibold tracking-[0.08em] py-1 px-2.5 rounded-full"
            style={{ background: typeConfig.bg, color: typeConfig.color }}
          >
            {typeConfig.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[22px] text-text-1 leading-[1.3] mb-3">
          {post.title}
        </h1>

        {/* Event info */}
        {post.type === "event" && post.eventDate && (
          <div className="flex gap-4 mb-3 text-sm text-accent flex-wrap">
            <span>📅 {new Date(post.eventDate).toLocaleDateString("sr-RS")}</span>
            {post.eventEndDate && (
              <span>— {new Date(post.eventEndDate).toLocaleDateString("sr-RS")}</span>
            )}
            {post.eventLocation && <span>📍 {post.eventLocation}</span>}
          </div>
        )}

        {/* Body */}
        {post.body && (
          <div className="text-[14px] text-text-2 leading-[1.7] mb-4 whitespace-pre-wrap">
            {post.body}
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <>
            {lightboxOpen && (
              <ImageLightbox
                images={[{ src: post.imageUrl, caption: post.title }]}
                index={0}
                onClose={() => setLightboxOpen(false)}
              />
            )}
            <img
              src={post.imageUrl}
              alt={post.title}
              onClick={() => setLightboxOpen(true)}
              className="w-full rounded-[10px] object-cover max-h-[500px] mb-4 cursor-zoom-in hover:opacity-95 transition-opacity"
            />
          </>
        )}

        {/* Tags */}
        {post.tags?.filter(t => t.trim()).length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {post.tags.filter(t => t.trim()).map((t) => (
              <span
                key={t}
                onClick={() => navigate(`/search?q=${encodeURIComponent(t.trim())}`)}
                className="text-[11px] py-0.75 px-2.25 rounded-full bg-surface-2 text-text-3 border border-border hover:bg-accent-soft hover:text-accent hover:border-accent cursor-pointer transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-surface-2 flex-wrap">
          <div className="flex items-center gap-px">
            <button
              onClick={() => user ? voteMutation.mutate("up") : navigate("/login", { state: { from: { pathname: `/post/${id}` }, background: location } })}
              className={`w-8 h-8 rounded-[7px_3px_3px_7px] border border-border cursor-pointer text-xs flex items-center justify-center transition-all ${
                currentUserVote === "up" ? "bg-accent text-white" : "bg-surface text-text-3"
              }`}
            >
              ▲
            </button>
            <span className="text-[13px] font-medium text-text-1 min-w-9 text-center">
              {currentVotes}
            </span>
            <button
              onClick={() => user ? voteMutation.mutate("down") : navigate("/login", { state: { from: { pathname: `/post/${id}` }, background: location } })}
              className={`w-8 h-8 rounded-[3px_7px_7px_3px] border border-border cursor-pointer text-xs flex items-center justify-center transition-all ${
                currentUserVote === "down" ? "bg-blue-500 text-white" : "bg-surface text-text-3"
              }`}
            >
              ▼
            </button>
          </div>

          <span className="text-[13px] text-text-3">
            💬 {post.commentsCount} komentara
          </span>
          <span className="text-[13px] text-text-3">
            👁 {post.viewsCount} pregleda
          </span>

          <ShareMenu
            url={`${window.location.origin}/post/${post.id}`}
            title={post.title}
            text={post.body?.slice(0, 100)}
            onShare={() => postsApi.share(post.id)}
          />

          {user?.id === post.authorId && (
            <button
              onClick={async () => {
                if (!confirm("Obrisati ovaj post?")) return;
                await postsApi.delete(post.id);
                queryClient.invalidateQueries({ queryKey: ["posts"] });
                navigate(-1);
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] text-danger hover:bg-danger-soft bg-transparent border-none cursor-pointer transition-colors"
            >
              🗑 Obriši post
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-surface border border-border rounded-[14px] p-6">
        <div className="font-serif text-[18px] text-text-1 mb-5">
          Komentari ({comments?.length ?? 0})
        </div>

        {/* New comment */}
        {user ? (
          <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent shrink-0 overflow-hidden border border-border">
              {user.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Dodaj komentar..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent resize-none font-sans bg-bg"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => commentMutation.mutate()}
                  disabled={!commentBody.trim() || commentMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50"
                >
                  Objavi komentar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3.5 rounded-xl bg-surface-2 border border-border">
            <span className="text-[13px] text-text-2">Prijavi se da ostaviš komentar</span>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => navigate("/login", { state: { from: { pathname: `/post/${id}` }, background: location } })}
                className="px-3.5 py-1.5 rounded-lg border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Prijavi se
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-accent-hover transition-colors"
              >
                Registruj se
              </button>
            </div>
          </div>
        )}

        {commentsLoading && (
          <div className="text-center py-8 text-text-3 text-[13px]">
            Učitavam komentare...
          </div>
        )}

        {!commentsLoading && comments?.length === 0 && (
          <div className="text-center py-10">
            <div className="text-[32px] mb-2">💬</div>
            <div className="text-[14px] text-text-3">Nema komentara još. Budi prvi!</div>
          </div>
        )}

        <div className="divide-y divide-surface-2">
          {comments?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={id!} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
