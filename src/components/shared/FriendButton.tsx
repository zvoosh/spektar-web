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

  const isMutating = sendMutation.isPending || acceptMutation.isPending || rejectMutation.isPending || removeMutation.isPending;

  const sm = size === "sm";

  if (isLoading) return (
    <div className={`${sm ? "h-7 w-20" : "h-10 w-32"} rounded-xl bg-surface-2 animate-pulse`} />
  );

  // Prijatelji — zeleno, na hover postaje crveno "Ukloni"
  if (status?.status === "accepted") {
    return (
      <button
        onClick={() => removeMutation.mutate()}
        disabled={isMutating}
        className={`group flex items-center gap-2 font-semibold border cursor-pointer transition-all disabled:opacity-50
          ${sm
            ? "px-2.5 py-1.5 rounded-lg text-[11px]"
            : "px-4 py-2.5 rounded-xl text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          }
          bg-accent-soft text-accent border-accent/20
          hover:bg-danger-soft hover:text-danger hover:border-danger/20`}
      >
        <UserCheck size={sm ? 12 : 15} strokeWidth={2.5} className="group-hover:hidden" />
        <UserX size={sm ? 12 : 15} strokeWidth={2} className="hidden group-hover:block" />
        <span className="group-hover:hidden">Prijatelji</span>
        <span className="hidden group-hover:inline">Ukloni</span>
      </button>
    );
  }

  // Zahtev poslat — amber/žuta nijansa
  if (status?.status === "pending" && status.isSender) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 font-semibold border cursor-not-allowed
          ${sm
            ? "px-2.5 py-1.5 rounded-lg text-[11px]"
            : "px-4 py-2.5 rounded-xl text-[13px]"
          }
          bg-warning-soft text-warning border-warning/20`}
      >
        <Clock size={sm ? 12 : 15} strokeWidth={2} />
        Zahtev poslat
      </button>
    );
  }

  // Primljeni zahtev — prihvati/odbij
  if (status?.status === "pending" && !status.isSender) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={() => acceptMutation.mutate()}
          disabled={isMutating}
          className={`flex items-center gap-2 font-semibold border cursor-pointer transition-all disabled:opacity-50
            ${sm
              ? "px-2.5 py-1.5 rounded-lg text-[11px]"
              : "px-4 py-2.5 rounded-xl text-[13px] shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
            }
            bg-accent text-white border-accent hover:bg-accent-hover`}
        >
          <UserCheck size={sm ? 12 : 15} strokeWidth={2.5} />
          Prihvati
        </button>
        <button
          onClick={() => rejectMutation.mutate()}
          disabled={isMutating}
          className={`flex items-center gap-2 font-semibold border cursor-pointer transition-all disabled:opacity-50
            ${sm
              ? "px-2.5 py-1.5 rounded-lg text-[11px]"
              : "px-4 py-2.5 rounded-xl text-[13px]"
            }
            bg-surface text-text-2 border-border hover:bg-danger-soft hover:text-danger hover:border-danger/20`}
        >
          <UserX size={sm ? 12 : 15} strokeWidth={2} />
          Odbij
        </button>
      </div>
    );
  }

  // Dodaj prijatelja
  return (
    <button
      onClick={() => sendMutation.mutate()}
      disabled={isMutating}
      className={`flex items-center gap-2 font-semibold border-none cursor-pointer transition-all disabled:opacity-50
        ${sm
          ? "px-2.5 py-1.5 rounded-lg text-[11px]"
          : "px-4 py-2.5 rounded-xl text-[13px] shadow-[0_2px_10px_rgba(0,186,124,0.35)]"
        }
        bg-accent text-white hover:bg-accent-hover`}
    >
      <UserPlus size={sm ? 12 : 15} strokeWidth={2.5} />
      Dodaj prijatelja
    </button>
  );
};

export default FriendButton;
