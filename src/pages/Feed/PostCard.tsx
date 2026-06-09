import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postsApi } from "@/api/posts";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthStore } from "@/store/authStore";
import type { Post } from "@/types";

import PostCardMeta from "./PostCardMeta";
import PostCardContent from "./PostCardContent";
import PostCardFooter from "./PostCardFooter";

const PostCard = ({ post }: { post: Post }) => {
  const { isMobile } = useBreakpoint();
  const { user, isAuthenticated } = useAuthStore();

  const [votes, setVotes] = useState(post.votesCount);
  const [userVote, setUserVote] = useState(post.userVote);
  const [isSaved, setIsSaved] = useState(post.isSaved);

  const voteMutation = useMutation({
    mutationFn: (type: "up" | "down") => postsApi.vote(post.id, type),
    onMutate: (type) => {
      const prevVotes = votes;
      const prevUserVote = userVote;
      if (userVote === type) {
        setUserVote(null);
        setVotes((v) => v + (type === "up" ? -1 : 1));
      } else if (userVote === null) {
        setUserVote(type);
        setVotes((v) => v + (type === "up" ? 1 : -1));
      } else {
        setUserVote(type);
        setVotes((v) => v + (type === "up" ? 2 : -2));
      }
      return { prevVotes, prevUserVote };
    },
    onSuccess: (data) => setVotes(data.votesCount),
    onError: (_, __, context) => {
      if (context) { setVotes(context.prevVotes); setUserVote(context.prevUserVote); }
      toast.error("Glasanje nije uspelo");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => postsApi.toggleSave(post.id),
    onMutate: () => { const prev = isSaved; setIsSaved(!isSaved); return { prev }; },
    onSuccess: (data) => setIsSaved(data.isSaved),
    onError: (_, __, context) => {
      if (context) setIsSaved(context.prev);
      toast.error("Nije uspelo");
    },
  });

  const handleVote = useCallback((type: "up" | "down") => voteMutation.mutate(type), [voteMutation]);
  const handleSave = useCallback(() => saveMutation.mutate(), [saveMutation]);

  return (
    <div className="bg-surface border border-border rounded-2xl mb-3 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px group">
      <div className={isMobile ? "px-4 py-3.5" : "px-5 py-4"}>
        <PostCardMeta post={post} />
        <PostCardContent post={post} isMobile={isMobile} />
        <PostCardFooter
          post={post}
          votes={votes}
          userVote={userVote}
          isSaved={isSaved}
          isMobile={isMobile}
          isAuthenticated={isAuthenticated}
          isOwn={user?.id === post.authorId}
          onVote={handleVote}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default PostCard;
