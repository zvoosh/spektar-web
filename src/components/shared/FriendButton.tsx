import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendsApi } from "@/api/friends";
import { UserPlus, UserCheck, UserX, Clock } from "lucide-react";

interface Props {
  userId: string;
  size?: "sm" | "md";
}

const FriendButton = ({ userId, size = "md" }: Props) => {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ["friend-status", userId],
    queryFn: () => friendsApi.getStatus(userId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["friend-status", userId] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
  };

  const sendMutation = useMutation({ mutationFn: () => friendsApi.sendRequest(userId), onSuccess: invalidate });
  const acceptMutation = useMutation({ mutationFn: () => friendsApi.accept(userId), onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: () => friendsApi.reject(userId), onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: () => friendsApi.remove(userId), onSuccess: invalidate });

  const isPending = sendMutation.isPending || acceptMutation.isPending || rejectMutation.isPending || removeMutation.isPending;

  const base = size === "sm"
    ? "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors disabled:opacity-50"
    : "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border cursor-pointer transition-colors disabled:opacity-50";

  if (isLoading) return null;

  if (status?.status === "accepted") {
    return (
      <button
        onClick={() => removeMutation.mutate()}
        disabled={isPending}
        className={`${base} bg-accent-soft text-accent border-accent/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200`}
      >
        <UserCheck size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
        Prijatelji
      </button>
    );
  }

  if (status?.status === "pending" && status.isSender) {
    return (
      <button disabled className={`${base} bg-surface-2 text-text-3 border-border cursor-not-allowed`}>
        <Clock size={size === "sm" ? 12 : 14} strokeWidth={2} />
        Zahtev poslat
      </button>
    );
  }

  if (status?.status === "pending" && !status.isSender) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={() => acceptMutation.mutate()}
          disabled={isPending}
          className={`${base} bg-accent text-white border-accent hover:bg-accent-hover`}
        >
          <UserCheck size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
          Prihvati
        </button>
        <button
          onClick={() => rejectMutation.mutate()}
          disabled={isPending}
          className={`${base} bg-white text-text-2 border-border hover:bg-red-50 hover:text-red-500`}
        >
          <UserX size={size === "sm" ? 12 : 14} strokeWidth={2} />
          Odbij
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => sendMutation.mutate()}
      disabled={isPending}
      className={`${base} bg-accent text-white border-accent hover:bg-accent-hover shadow-[0_2px_8px_rgba(26,138,87,0.25)]`}
    >
      <UserPlus size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
      Dodaj prijatelja
    </button>
  );
};

export default FriendButton;
