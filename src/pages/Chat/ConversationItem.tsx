import { memo } from "react";
import { formatTime, getConvInfo } from "./chatHelpers";
import type { Conversation } from "@/types";

interface Props {
  conv: Conversation;
  active: boolean;
  myId?: string;
  onClick: () => void;
}

const ConversationItem = memo(({ conv, active, myId, onClick }: Props) => {
  const info = getConvInfo(conv, myId);
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
        active ? "bg-accent-soft" : "hover:bg-surface-2-2"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-accent-soft border border-border flex items-center justify-center text-sm font-semibold text-accent shrink-0 overflow-hidden">
        {info.avatar ? (
          <img src={info.avatar} alt={info.name} className="w-full h-full object-cover" />
        ) : (
          info.initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[13px] truncate ${active ? "text-accent font-medium" : "text-text-1 font-medium"}`}>
            {info.name}
          </span>
          {conv.lastMessageAt && (
            <span className="text-[10px] text-text-3 shrink-0 ml-2">
              {formatTime(conv.lastMessageAt)}
            </span>
          )}
        </div>
        {conv.lastMessage && (
          <div className="text-[11px] text-text-3 truncate mt-0.5">{conv.lastMessage}</div>
        )}
      </div>
    </div>
  );
});

export default ConversationItem;
