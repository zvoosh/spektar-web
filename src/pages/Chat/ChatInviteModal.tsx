import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Search } from "lucide-react";
import { chatApi } from "@/api/chat";
import { usersApi } from "@/api/users";
import type { User } from "@/types";

const UserRow = ({ u, onClick }: { u: User; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-2-2 transition-colors"
  >
    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden shrink-0 border border-border">
      {u.avatar ? <img loading="lazy" src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-medium text-text-1">{u.username}</div>
      {u.bio && <div className="text-[11px] text-text-3 truncate">{u.bio}</div>}
    </div>
  </div>
);

interface Props {
  conversationId: string;
  onClose: () => void;
}

const ChatInviteModal = ({ conversationId, onClose }: Props) => {
  const [q, setQ] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => usersApi.search(q, true),
    enabled: q.length >= 2,
  });

  const inviteMutation = useMutation({
    mutationFn: (userId: string) => chatApi.inviteMember(conversationId, userId),
    onSuccess: () => onClose(),
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-semibold text-[15px] text-text-1">Dodaj u grupu</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border">
            <X size={14} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraži korisnike..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-[13px] outline-none focus:border-accent bg-surface-2"
            />
          </div>
          {q.length < 2 && <p className="text-[12px] text-text-3 text-center py-4">Unesi bar 2 slova</p>}
          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {users?.map((u: User) => (
              <UserRow key={u.id} u={u} onClick={() => inviteMutation.mutate(u.id)} />
            ))}
          </div>
          {inviteMutation.isError && (
            <p className="text-[12px] text-red-500 text-center mt-2">
              Korisnik možda već je član ili nije u zajednici.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInviteModal;
