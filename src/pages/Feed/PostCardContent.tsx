import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { Post } from "@/types";

interface Props {
  post: Post;
  isMobile: boolean;
}

const PostCardContent = memo(({ post, isMobile }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3.5 items-start">
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div
          onClick={() => navigate(`/post/${post.id}`)}
          className={`font-serif leading-snug text-text-1 mb-1.5 cursor-pointer group-hover:text-accent transition-colors duration-150 ${
            isMobile ? "text-[15px]" : "text-[17px]"
          }`}
        >
          {post.title}
        </div>

        {/* Body preview */}
        {post.body && (
          <p className="text-[13px] text-text-2 leading-relaxed mb-2.5 line-clamp-2">
            {post.body}
          </p>
        )}

        {/* Event date / location */}
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

        {/* Tags */}
        {post.tags?.filter((t) => t.trim()).length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {post.tags.filter((t) => t.trim()).map((t) => {
              const clean = t.trim().replace(/^#+/, "");
              return (
                <span
                  key={t}
                  onClick={(e) => { e.stopPropagation(); navigate(`/search?tag=${encodeURIComponent(clean)}`); }}
                  className="text-[11px] py-0.5 px-2 rounded-md bg-surface-2 text-text-3 hover:bg-accent-soft hover:text-accent cursor-pointer transition-colors"
                >
                  #{clean}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          onClick={() => navigate(`/post/${post.id}`)}
          className={`rounded-xl object-cover shrink-0 cursor-pointer hover:opacity-95 transition-opacity ${
            isMobile ? "w-20 h-16" : "w-32 h-24"
          }`}
        />
      )}
    </div>
  );
});

export default PostCardContent;
