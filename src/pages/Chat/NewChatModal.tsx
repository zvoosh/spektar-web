import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Search } from "lucide-react";
import { chatApi } from "@/api/chat";
import { usersApi } from "@/api/users";
import type { Conversation, User } from "@/types";

const UserRow = ({ u, selected, onClick }: { u: User; selected?: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${selected ? "bg-accent-soft" : "hover:bg-surface-2-2"}`}
  >
    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden shrink-0 border border-border">
      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-medium text-text-1">{u.username}</div>
      {u.bio && <div className="text-[11px] text-text-3 truncate">{u.bio}</div>}
    </div>
    {selected && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-[10px] shrink-0">✓</div>}
  </div>
);

interface Props {
  onClose: () => void;
  onStart: (conv: Conversation) => void;
}

const NewChatModal = ({ onClose, onStart }: Props) => {
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [q, setQ] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<User[]>([]);

  const { data: users } = useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => usersApi.search(q),
    enabled: q.length >= 2,
  });

  const dmMutation = useMutation({
    mutationFn: (userId: string) => chatApi.createDM(userId),
    onSuccess: (conv) => onStart(conv),
  });

  const groupMutation = useMutation({
    mutationFn: () => chatApi.createGroup(groupName, selected.map((u) => u.id)),
    onSuccess: (conv) => onStart(conv),
  });

  const toggleUser = (u: User) => {
    setSelected((prev) =>
      prev.find((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-semibold text-[15px] text-text-1">Nova poruka</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border">
            <X size={14} />
          </button>
        </div>

        <div className="flex border-b border-border">
          {(["dm", "group"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelected([]); }}
              className={`flex-1 py-2.5 text-[13px] font-medium border-none cursor-pointer border-b-2 -mb-px transition-colors ${mode === m ? "border-accent text-accent bg-surface" : "border-transparent text-text-3 bg-surface hover:text-text-1"}`}
            >
              {m === "dm" ? "Direktna poruka" : "Nova grupa"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === "group" && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Naziv grupe..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] outline-none focus:border-accent mb-3 font-sans bg-surface"
            />
          )}

          {mode === "group" && selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selected.map((u) => (
                <span
                  key={u.id}
                  onClick={() => toggleUser(u)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[12px] font-medium cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  {u.username} <X size={10} />
                </span>
              ))}
            </div>
          )}

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

          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {users?.map((u: User) => (
              mode === "dm"
                ? <UserRow key={u.id} u={u} onClick={() => dmMutation.mutate(u.id)} />
                : <UserRow key={u.id} u={u} selected={!!selected.find((s) => s.id === u.id)} onClick={() => toggleUser(u)} />
            ))}
          </div>

          {mode === "group" && selected.length > 0 && (
            <button
              onClick={() => groupMutation.mutate()}
              disabled={!groupName.trim() || groupMutation.isPending}
              className="w-full mt-3 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50 hover:bg-accent-hover transition-colors"
            >
              {groupMutation.isPending ? "Kreiram..." : `Kreiraj grupu (${selected.length} članova)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
