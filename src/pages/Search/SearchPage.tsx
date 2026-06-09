import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { communitiesApi } from "@/api/communities";
import { usersApi } from "@/api/users";
import { chatApi } from "@/api/chat";
import PostCard from "@/pages/Feed/PostCard";
import FriendButton from "@/components/shared/FriendButton";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@/types";
import { useAuthStore } from "@/store/authStore";

type Tab = "posts" | "communities" | "users";

const SearchPage = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const [searchParams, setSearchParams] = useSearchParams();

  // `tag` param — direktno iz trending (pretraga po tagu)
  const tagParam = searchParams.get("tag") ?? "";

  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipDebounceRef = useRef(false);

  // Kad se URL promeni spolja (klik na tag u Trending/PostCard)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const tag = searchParams.get("tag") ?? "";
    skipDebounceRef.current = true; // ne okidaj debounce za ovu promenu
    if (tag) {
      setInputValue("");  // input prazan — tag se prikazuje kao chip, ne u inputu
      setQuery("");
    } else {
      setInputValue(q);
      setQuery(q);
    }
  }, [searchParams.get("q"), searchParams.get("tag")]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const trimmed = inputValue.trim();
      if (trimmed) {
        setSearchParams({ q: trimmed }, { replace: true });
        setQuery(trimmed);
      } else {
        setSearchParams({}, { replace: true });
        setQuery("");
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  // Tag search (kada dođe iz Trending)
  const { data: tagPosts, isLoading: tagPostsLoading } = useQuery({
    queryKey: ["search", "tag", tagParam],
    queryFn: () => postsApi.getByTag(tagParam),
    enabled: !!tagParam,
  });

  // Text search
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["search", "posts", query],
    queryFn: () => postsApi.search(query),
    enabled: !tagParam && query.length >= 2,
  });

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["search", "communities", query],
    queryFn: () => communitiesApi.search(query),
    enabled: query.length >= 2,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["search", "users", query],
    queryFn: () => usersApi.search(query),
    enabled: query.length >= 2,
  });

  const { user: me } = useAuthStore();

  const dmMutation = useMutation({
    mutationFn: (userId: string) => chatApi.createDM(userId),
    onSuccess: () => { if (mountedRef.current) navigate(`/chat`); },
  });

  const isLoading = tagParam ? tagPostsLoading : (postsLoading || communitiesLoading || usersLoading);
  const hasResults = tagParam
    ? (tagPosts?.length ?? 0) > 0
    : (posts?.length ?? 0) + (communities?.length ?? 0) + (users?.length ?? 0) > 0;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 text-base pointer-events-none">
          🔍
        </span>
        <input
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pretraži postove, zajednice..."
          className="w-full pl-11 pr-5 py-3.5 rounded-[12px] border border-border bg-surface text-[15px] text-text-1 outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] font-sans transition-all"
        />
        {inputValue && (
          <button
            onClick={() => { setInputValue(""); setQuery(""); setSearchParams({}, { replace: true }); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag mode — direktna pretraga po tagu */}
      {tagParam && (
        <div className="mb-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-soft border border-accent/30 text-accent text-[13px] font-semibold">
            # {tagParam}
          </span>
          <span className="text-[12px] text-text-3">— postovi sa ovim tagom</span>
        </div>
      )}

      {/* Empty state */}
      {!query && !tagParam && (
        <div className="text-center py-16">
          <div className="text-[48px] mb-3">🔍</div>
          <div className="font-serif text-[17px] text-text-1 mb-1">Pretraži Spektar</div>
          <div className="text-[13px] text-text-3">
            Pronađi postove, zajednice, događaje i ljude
          </div>
        </div>
      )}

      {!tagParam && query.length === 1 && (
        <div className="text-center py-8 text-text-3 text-[13px]">
          Unesi bar 2 slova...
        </div>
      )}

      {/* Tag results */}
      {tagParam && (
        <>
          {isLoading && <div className="text-center py-10 text-text-3">Pretražujem...</div>}
          {!isLoading && !hasResults && (
            <div className="text-center py-12 bg-surface rounded-[14px] border border-border">
              <div className="text-[40px] mb-3">🏷️</div>
              <div className="font-serif text-[15px] text-text-1 mb-1">Nema postova sa tagom „{tagParam}"</div>
              <div className="text-[13px] text-text-3">Budi prvi koji će ga koristiti</div>
            </div>
          )}
          {!isLoading && tagPosts?.map((post) => <PostCard key={post.id} post={post} />)}
        </>
      )}

      {!tagParam && query.length >= 2 && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border">
            {(["posts", "communities", "users"] as Tab[]).map((tab) => {
              const count = tab === "posts" ? posts?.length : tab === "communities" ? communities?.length : users?.length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-[13px] border-none bg-transparent cursor-pointer border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                    activeTab === tab
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-text-2 hover:text-text-1"
                  }`}
                >
                  {tab === "posts" ? "Postovi" : tab === "communities" ? "Zajednice" : "Korisnici"}
                  {count != null && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-accent text-white" : "bg-surface-2 text-text-3"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <div className="text-center py-10 text-text-3">Pretražujem...</div>
          )}

          {!isLoading && !hasResults && (
            <div className="text-center py-12 bg-surface rounded-[14px] border border-border">
              <div className="text-[40px] mb-3">🔍</div>
              <div className="font-serif text-[15px] text-text-1 mb-1">
                Nema rezultata za „{query}"
              </div>
              <div className="text-[13px] text-text-3">Probaj sa drugačijim pojmom</div>
            </div>
          )}

          {activeTab === "posts" && !postsLoading && (
            <>
              {posts?.length === 0 && hasResults ? (
                <div className="text-center py-8 text-text-3 text-[13px]">
                  Nema postova koji odgovaraju pretazi
                </div>
              ) : (
                posts?.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </>
          )}

          {activeTab === "users" && !usersLoading && (
            <div className="grid grid-cols-1 gap-3">
              {(users?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-text-3 text-[13px]">Nema korisnika</div>
              ) : (
                users?.map((u: User) => (
                  <div key={u.id} onClick={() => navigate(`/u/${u.username}`)} className="bg-surface border border-border rounded-[14px] p-4 flex items-center gap-4 cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-base font-bold text-accent shrink-0 overflow-hidden border border-border">
                      {u.avatar ? <img loading="lazy" src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-text-1">{u.username}</div>
                      {u.bio && <div className="text-[12px] text-text-3 truncate">{u.bio}</div>}
                      <div className="text-[11px] text-text-3 mt-0.5">Karma: {u.karma}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {me?.id !== u.id && <FriendButton userId={u.id} size="sm" />}
                      <button
                        onClick={() => dmMutation.mutate(u.id)}
                        className="px-3 py-1.5 rounded-lg border border-border text-text-2 text-[11px] font-semibold bg-surface cursor-pointer hover:bg-surface-2-2"
                      >
                        Poruka
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "communities" && !communitiesLoading && (
            <div className="grid grid-cols-1 gap-3">
              {communities?.length === 0 && hasResults ? (
                <div className="text-center py-8 text-text-3 text-[13px]">
                  Nema zajednica koje odgovaraju pretazi
                </div>
              ) : (
                communities?.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => navigate(`/c/${community.slug}`)}
                    className="bg-surface border border-border rounded-[14px] p-4 flex gap-4 cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center text-xl font-semibold text-accent shrink-0 overflow-hidden">
                      {community.avatar ? (
                        <img loading="lazy" src={community.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        community.name.slice(0, 1)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-[15px] text-text-1">{community.name}</span>
                        {community.type !== "public" && (
                          <span className="text-[10px] text-text-3">🔒</span>
                        )}
                      </div>
                      {community.description && (
                        <p className="text-[12px] text-text-3 line-clamp-1 mb-1.5">
                          {community.description}
                        </p>
                      )}
                      <div className="text-[11px] text-text-3">
                        {community.membersCount.toLocaleString("sr-RS")} članova · {community.category}
                      </div>
                    </div>
                    {community.isMember ? (
                      <span className="self-center text-[11px] text-text-3 shrink-0">✓ Član</span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); communitiesApi.join(community.id); }}
                        className="self-center px-3 py-1.5 rounded-lg border border-accent text-accent text-[12px] font-medium bg-surface cursor-pointer shrink-0 hover:bg-accent-soft"
                      >
                        Pridruži se
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
