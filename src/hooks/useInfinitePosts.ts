import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { postsApi } from "@/api/posts";

export function useFeedInfinite(filter?: string) {
  const query = useInfiniteQuery({
    queryKey: ["posts", "feed", "infinite"],
    queryFn: ({ pageParam = 1 }) => postsApi.getFeed(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
  });

  const allPosts = query.data?.pages.flatMap((p) => p.posts) ?? [];
  const filtered = filter ? allPosts.filter((p) => p.type === filter) : allPosts;

  return { ...query, posts: filtered };
}

export function useCommunityPostsInfinite(communityId: string) {
  const query = useInfiniteQuery({
    queryKey: ["posts", "community", communityId, "infinite"],
    queryFn: ({ pageParam = 1 }) => postsApi.getByCommunity(communityId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
    enabled: !!communityId,
  });

  const allPosts = query.data?.pages.flatMap((p) => p.posts) ?? [];

  return { ...query, posts: allPosts };
}

// Hook za IntersectionObserver sentinel
export function useInfiniteScroll(
  fetchNextPage: () => void,
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return sentinelRef;
}
