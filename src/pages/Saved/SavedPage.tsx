import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import PostCard from "@/pages/Feed/PostCard";

const SavedPage = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "saved"],
    queryFn: postsApi.getSaved,
  });

  return (
    <div>
      {isLoading && (
        <div className="text-center p-10 text-text-3">Učitavam...</div>
      )}

      {!isLoading && posts?.length === 0 && (
        <div className="text-center p-12 bg-white rounded-[14px] border border-border">
          <div className="text-[40px] mb-3">🔖</div>
          <div className="font-serif text-[15px] text-text-1 mb-1">
            Nema sačuvanih postova
          </div>
          <div className="text-[13px] text-text-3">
            Klikni na 🔖 na bilo kom postu da ga sačuvaš za kasnije.
          </div>
        </div>
      )}

      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default SavedPage;
