import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import type { Post } from "@/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const POST_TYPE_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
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

const actionBtn =
  "text-xs bg-transparent border-none cursor-pointer flex items-center gap-[5px] font-sans py-1 px-2 rounded-md hover:bg-surface-2";

const PostCard = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [votes, setVotes] = useState(post.votesCount);
  const [userVote, setUserVote] = useState(post.userVote);
  const [isSaved, setIsSaved] = useState(post.isSaved);

  const typeConfig = POST_TYPE_LABELS[post.type] || POST_TYPE_LABELS.discussion;

  const voteMutation = useMutation({
    mutationFn: (type: "up" | "down") => postsApi.vote(post.id, type),
    onSuccess: (data) => {
      setVotes(data.votesCount);
      setUserVote((prev) => (prev === "up" ? null : "up"));
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => postsApi.toggleSave(post.id),
    onSuccess: (data) => setIsSaved(data.isSaved),
  });

  return (
    <div
      className={`bg-white border border-border rounded-[14px] mb-3 transition-shadow duration-150 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${
        isMobile ? "px-4 py-[14px]" : "px-[22px] py-5"
      }`}
    >
      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[34px] h-[34px] rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent shrink-0">
          {post.author?.username?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-medium text-text-1">
              {post.author?.username}
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
          </div>
        </div>
        <span
          className="text-[10px] font-semibold tracking-[0.08em] py-1 px-2.5 rounded-full shrink-0"
          style={{ background: typeConfig.bg, color: typeConfig.color }}
        >
          {typeConfig.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex gap-3.5 items-start">
        <div className="flex-1 min-w-0">
          <div
            onClick={() => navigate(`/post/${post.id}`)}
            className={`font-serif leading-[1.35] text-text-1 mb-2 cursor-pointer transition-colors duration-100 hover:text-accent ${
              isMobile ? "text-base" : "text-lg"
            }`}
          >
            {post.title}
          </div>

          {post.body && (
            <div className="text-[13px] text-text-2 leading-[1.65] mb-2.5 font-light line-clamp-2">
              {post.body}
            </div>
          )}

          {post.type === "event" && post.eventDate && (
            <div className="flex gap-3 mb-2.5 text-xs text-accent flex-wrap">
              <span>
                📅 {new Date(post.eventDate).toLocaleDateString("sr-RS")}
              </span>
              {post.eventLocation && <span>📍 {post.eventLocation}</span>}
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] py-[3px] px-[9px] rounded-full bg-surface-2 text-text-3 border border-border cursor-pointer"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className={`rounded-[10px] object-cover shrink-0 ${
              isMobile ? "w-[90px] h-[70px]" : "w-35 h-25"
            }`}
          />
        )}
      </div>

      {/* Footer */}
      <div
        className={`flex items-center pt-3 border-t border-surface-2 flex-wrap ${
          isMobile ? "gap-1" : "gap-2"
        }`}
      >
        {/* Vote */}
        <div className="flex items-center gap-px">
          <button
            onClick={() => voteMutation.mutate("up")}
            className={`w-[30px] h-[30px] rounded-[7px_3px_3px_7px] border border-border cursor-pointer text-xs flex items-center justify-center transition-all duration-100 ${
              userVote === "up" ? "bg-accent text-white" : "bg-white text-text-3"
            }`}
          >
            ▲
          </button>
          <span className="text-[13px] font-medium text-text-1 min-w-8 text-center">
            {votes}
          </span>
          <button
            onClick={() => voteMutation.mutate("down")}
            className={`w-[30px] h-[30px] rounded-[3px_7px_7px_3px] border border-border cursor-pointer text-xs flex items-center justify-center transition-all duration-100 ${
              userVote === "down" ? "bg-blue text-white" : "bg-white text-text-3"
            }`}
          >
            ▼
          </button>
        </div>

        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className={`${actionBtn} text-text-2`}
        >
          💬 {isMobile ? post.commentsCount : `${post.commentsCount} komentara`}
        </button>

        <button
          onClick={() => saveMutation.mutate()}
          className={`${actionBtn} ${isSaved ? "text-accent" : "text-text-2"}`}
        >
          🔖 {!isMobile && (isSaved ? "Sačuvano" : "Sačuvaj")}
        </button>

        <button
          onClick={() => postsApi.share(post.id)}
          className={`${actionBtn} text-text-2`}
        >
          ↗ {!isMobile && "Podeli"}
        </button>

        <button className="ml-auto w-7 h-7 rounded-md border border-border bg-white text-text-3 cursor-pointer text-sm flex items-center justify-center">
          ···
        </button>
      </div>
    </div>
  );
};

export default PostCard;
