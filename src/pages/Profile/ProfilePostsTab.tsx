import { memo } from "react";
import PostCard from "@/pages/Feed/PostCard";
import { FeedSkeleton } from "@/components/shared/Skeleton";
import type { Post } from "@/types";

interface Props {
  posts: Post[] | undefined;
  isLoading: boolean;
}

const ProfilePostsTab = memo(({ posts, isLoading }: Props) => {
  if (isLoading) return <FeedSkeleton count={3} />;

  if (!posts?.length) {
    return (
      <div className="text-center py-12 bg-surface rounded-2xl border border-border">
        <div className="text-[40px] mb-3">📝</div>
        <div className="font-serif text-[15px] text-text-1 mb-1">Nema objavljenih postova</div>
        <div className="text-[13px] text-text-3">Tvoji postovi će se ovde pojaviti.</div>
      </div>
    );
  }

  return <>{posts.map((post) => <PostCard key={post.id} post={post} />)}</>;
});

export default ProfilePostsTab;
