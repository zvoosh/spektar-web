import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { POST_TYPE_CONFIG, formatDate } from "./postCardHelpers";
import type { Post } from "@/types";

interface Props {
  post: Post;
}

const PostCardMeta = memo(({ post }: Props) => {
  const navigate = useNavigate();
  const cfg = POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.discussion;

  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent/20 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 overflow-hidden">
        {post.author?.avatar ? (
          <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (post.author?.displayName || post.author?.username)?.slice(0, 2).toUpperCase()
        )}
      </div>

      {/* Author / community / time */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.author?.username}`); }}
            className="text-[12.5px] font-semibold text-text-1 cursor-pointer hover:text-accent transition-colors"
          >
            {post.author?.displayName || post.author?.username}
          </span>
          <span className="text-[11px] text-text-3">u</span>
          <span
            onClick={(e) => { e.stopPropagation(); navigate(`/c/${post.community?.slug}`); }}
            className="text-[12.5px] font-semibold text-accent cursor-pointer hover:underline"
          >
            {post.community?.name}
          </span>
          <span className="text-[11px] text-text-3">· {formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Type badge */}
      <span
        className="text-[10.5px] font-semibold py-0.5 px-2.5 rounded-full shrink-0 flex items-center gap-1"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
        {cfg.label}
      </span>
    </div>
  );
});

export default PostCardMeta;
