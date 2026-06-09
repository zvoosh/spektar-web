import { memo } from "react";
import { PenSquare } from "lucide-react";
import ConversationItem from "./ConversationItem";
import type { Conversation } from "@/types";

interface Props {
  conversations: Conversation[] | undefined;
  activeConvId: string | null;
  myId?: string;
  isMobile: boolean;
  onOpenConv: (convId: string) => void;
  onNewChat: () => void;
}

const ConversationsSidebar = memo(({ conversations, activeConvId, myId, isMobile, onOpenConv, onNewChat }: Props) => (
  <div className={`${isMobile ? "w-full" : "w-72"} border-r border-border flex flex-col shrink-0`}>
    <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
      <span className="font-semibold text-[15px] text-text-1">Poruke</span>
      <button
        onClick={onNewChat}
        className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center border-none cursor-pointer hover:bg-accent hover:text-white text-accent transition-colors"
      >
        <PenSquare size={14} strokeWidth={2.5} />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {!conversations?.length && (
        <div className="text-center py-12 px-4">
          <div className="text-[32px] mb-2">💬</div>
          <div className="text-[13px] text-text-3">Nema razgovora</div>
        </div>
      )}
      {conversations?.map((conv) => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          active={conv.id === activeConvId}
          myId={myId}
          onClick={() => onOpenConv(conv.id)}
        />
      ))}
    </div>
  </div>
));

export default ConversationsSidebar;
