import { useState } from "react";

interface Props {
  members: any[];
  currentUserId: string;
  isPending: boolean;
  onClose: () => void;
  onLeave: (newOwnerId: string) => void;
}

const LeaveOwnershipModal = ({ members, currentUserId, isPending, onClose, onLeave }: Props) => {
  const [selectedNewOwner, setSelectedNewOwner] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-serif text-[18px] text-text-1 mb-1">Napusti zajednicu</h2>
        <p className="text-[13px] text-text-2 mb-5">
          Kao vlasnik, moraš preneti vlasništvo na drugog člana pre nego što napustiš zajednicu.
        </p>

        <label className="text-[12px] font-medium text-text-2 mb-2 block">
          Odaberi novog vlasnika
        </label>
        <select
          value={selectedNewOwner}
          onChange={(e) => setSelectedNewOwner(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text-1 text-[13px] mb-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">-- Odaberi člana --</option>
          {members
            .filter((m: any) => m.userId !== currentUserId)
            .map((m: any) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.displayName || m.user?.username}
                {m.role === "moderator" ? " (moderator)" : ""}
              </option>
            ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-1 text-[13px] font-medium cursor-pointer hover:bg-surface-2 transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={() => onLeave(selectedNewOwner)}
            disabled={!selectedNewOwner || isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            {isPending ? "Čekaj..." : "Prenesi i napusti"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveOwnershipModal;
