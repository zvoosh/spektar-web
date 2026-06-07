import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { useState } from "react";
import PostCard from "./PostCard";
import { Users, Zap, ChevronDown, Loader2 } from "lucide-react";
import ShareMenu from "@/components/shared/ShareMenu";
import { useFeedInfinite, useInfiniteScroll } from "@/hooks/useInfinitePosts";

const FILTERS = [
  { label: "Svi", value: "" },
  { label: "Diskusije", value: "discussion" },
  { label: "Pitanja", value: "question" },
  { label: "Događaji", value: "event" },
  { label: "Preporuke", value: "recommendation" },
  { label: "Obaveštenja", value: "announcement" },
];

const CommunityBanner = () => {
  const { data: stats } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: usersApi.getStats,
    staleTime: 5 * 60000,
  });

  return (
    <div className="relative rounded-2xl overflow-hidden mb-5 h-52 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
      <img
        src={"/hero/kalemegdan.jpg"}
        alt={"Spektar Beograda"}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-[24px] text-white leading-tight mb-1.5 drop-shadow-sm">
              Spektar Beograda
            </h1>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-[12.5px] text-white/90 font-medium">
                <Users size={13} strokeWidth={2.5} />
                {stats
                  ? `${stats.totalUsers.toLocaleString("sr-RS")} korisnika`
                  : "—"}
              </div>
              <div className="flex items-center gap-1.5 text-[12.5px] text-white/70">
                <Zap size={11} strokeWidth={2.5} className="text-green-400" />
                {stats
                  ? `${stats.activeToday.toLocaleString("sr-RS")} aktivnih danas`
                  : "—"}
              </div>
            </div>
            <p className="text-[12px] text-white/60 leading-relaxed max-w-md hidden sm:block">
              Mesto za povezivanje, deljenje preporuka, događaja i priča iz našeg grada.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <ShareMenu
              url={window.location.origin}
              title="Spektar Beograda"
              text="Mesto za povezivanje, deljenje preporuka, događaja i priča iz našeg grada."
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-sm hover:text-white"
              showLabel={true}
              label="Podeli"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedPage = () => {
  const [activeFilter, setActiveFilter] = useState("");

  const {
    posts: filtered,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedInfinite(activeFilter);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  return (
    <div>
      <CommunityBanner />

      {/* Filter bar */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap bg-surface border border-border rounded-xl px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={[
              "px-3.5 py-1.5 rounded-lg text-[12.5px] border-none cursor-pointer transition-all duration-150 font-medium",
              activeFilter === f.value
                ? "bg-accent text-white shadow-[0_2px_8px_rgba(26,138,87,0.3)]"
                : "bg-transparent text-text-3 hover:bg-surface-2-2 hover:text-text-1",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12.5px] bg-surface-2 text-text-2 cursor-pointer border-none font-medium hover:bg-border transition-colors">
          Najnovije <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-surface-2" />
                <div className="flex-1">
                  <div className="h-3 bg-surface-2 rounded w-1/3 mb-2" />
                </div>
              </div>
              <div className="h-4 bg-surface-2 rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-2 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered?.length === 0 && (
        <div className="text-center p-12 bg-surface rounded-2xl border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <div className="font-serif text-[16px] text-text-1 mb-1">Nema postova</div>
          <div className="text-[13px] text-text-3">Budi prvi koji će nešto objaviti!</div>
        </div>
      )}

      {filtered?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll sentinel */}
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
    </div>
  );
};

export default FeedPage;
