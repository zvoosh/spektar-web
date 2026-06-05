import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import PostCard from "@/pages/Feed/PostCard";

type Period = "day" | "week" | "month" | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Danas", value: "day" },
  { label: "Ove nedelje", value: "week" },
  { label: "Ovog meseca", value: "month" },
  { label: "Svih vremena", value: "all" },
];

const PopularPage = () => {
  const [period, setPeriod] = useState<Period>("week");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "popular", period],
    queryFn: () => postsApi.getPopular(period),
  });

  return (
    <div>
      {/* Period filter */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={[
              "px-4 py-1.75 rounded-full text-[13px] border cursor-pointer transition-all duration-150",
              period === p.value
                ? "border-accent bg-accent text-white font-medium"
                : "border-border bg-white text-text-2",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center p-10 text-text-3">Učitavam...</div>
      )}

      {!isLoading && posts?.length === 0 && (
        <div className="text-center p-12 bg-white rounded-[14px] border border-border">
          <div className="text-[40px] mb-3">😶</div>
          <div className="font-serif text-[15px] text-text-1 mb-1">
            Nema popularnih postova
          </div>
          <div className="text-[13px] text-text-3">
            Probaj drugi vremenski period.
          </div>
        </div>
      )}

      {posts?.map((post, i) => (
        <div key={post.id} className="relative">
          {i < 3 && (
            <div
              className="absolute -left-1 top-3 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{
                background:
                  i === 0 ? "#F5A623" : i === 1 ? "#9B9B9B" : "#CD7F32",
              }}
            >
              {i + 1}
            </div>
          )}
          <div className={i < 3 ? "ml-6" : ""}>
            <PostCard post={post} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularPage;
