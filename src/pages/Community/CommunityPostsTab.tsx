import { memo, useMemo, useState, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import PostCard from "@/pages/Feed/PostCard";
import type { Post } from "@/types";

const FILTERS = [
  { label: "Svi", value: "" },
  { label: "Diskusije", value: "discussion" },
  { label: "Pitanja", value: "question" },
  { label: "DogaÄ‘aji", value: "event" },
  { label: "Preporuke", value: "recommendation" },
  { label: "ObaveÅ¡tenja", value: "announcement" },
];

interface Props {
  posts: Post[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

const CommunityPostsTab = memo(({ posts, isLoading, hasNextPage, isFetchingNextPage, sentinelRef }: Props) => {
  const [activeFilter, setActiveFilter] = useState("");

  const filtered = useMemo(
    () => (activeFilter ? posts.filter((p) => p.type === activeFilter) : posts),
    [posts, activeFilter]
  );

  return (
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

      {isLoading && (
        <div className="text-center p-10 text-text-3">UÄitavam postove...</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center p-10 bg-surface rounded-2xl border border-border">
          <div className="text-[32px] mb-3">ðŸ“­</div>
          <div className="font-serif text-[15px] text-text-1">Nema postova</div>
          <div className="text-[13px] mt-1 text-text-3">Budi prvi koji Ä‡e neÅ¡to objaviti!</div>
        </div>
      )}

      {filtered.map((post) => (
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
  );
});

export default CommunityPostsTab;
