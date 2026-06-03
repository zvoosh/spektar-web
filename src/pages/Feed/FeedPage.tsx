import { useQuery } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";
import { postsApi } from "@/api/posts";
import { useState } from "react";
import PostCard from "./PostCard";

const FILTERS = [
  { label: "Svi postovi", value: "" },
  { label: "Diskusije", value: "discussion" },
  { label: "Pitanja", value: "question" },
  { label: "Događaji", value: "event" },
  { label: "Preporuke", value: "recommendation" },
  { label: "Obaveštenja", value: "announcement" },
];

const FeedPage = () => {
  const [activeFilter, setActiveFilter] = useState("");

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAll,
  });

  const firstCommunity = communities?.[0];

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", firstCommunity?.id],
    queryFn: () => postsApi.getByCommunity(firstCommunity!.id),
    enabled: !!firstCommunity,
  });

  const filtered = activeFilter
    ? posts?.filter((p) => p.type === activeFilter)
    : posts;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={[
              "px-4 py-1.75 rounded-full text-[13px] border cursor-pointer transition-all duration-150",
              activeFilter === f.value
                ? "border-accent bg-accent text-white font-medium"
                : "border-border bg-white text-text-2 font-normal",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
        <div className="xl:ml-auto">
          <button className="flex items-center gap-1.25 px-3.5 py-1.75 rounded-full text-xs border border-border bg-white text-text-2 cursor-pointer">
            Najnovije ▾
          </button>
        </div>
      </div>

      {/* Posts */}
      {isLoading && (
        <div className="text-center p-10 text-text-3">
          Učitavam postove...
        </div>
      )}

      {!isLoading && filtered?.length === 0 && (
        <div className="text-center p-10 bg-white rounded-[14px] border border-border text-text-3">
          <div className="text-[32px] mb-3">📭</div>
          <div className="text-[15px] font-(--font-serif)">
            Nema postova
          </div>
          <div className="text-[13px] mt-1">
            Budi prvi koji će nešto objaviti!
          </div>
        </div>
      )}

      {filtered?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedPage;
