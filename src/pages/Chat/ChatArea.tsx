import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, UserPlus } from "lucide-react";
import { uploadApi } from "@/api/upload";
import ImageLightbox from "@/components/shared/ImageLightbox";
import MessageBubble from "./MessageBubble";
import { formatDay, getConvInfo } from "./chatHelpers";
import type { Conversation, Message } from "@/types";

interface Props {
  activeConv: Conversation | null;
  myId?: string;
  messages: Message[];
  typingUsers: string[];
  sendMessage: (content: string, replyToId?: string, imageUrl?: string, file?: { fileUrl: string; fileName: string; fileSize: number; mimeType: string }) => void;
  deleteMessage: (id: string) => void;
  sendTyping: () => void;
  sendStopTyping: () => void;
  isMobile: boolean;
  onBack: () => void;
  onShowInvite: () => void;
  onMessageSent: () => void; // triggers conversation list refresh
}

const ChatArea = ({
  activeConv,
  myId,
  messages,
  typingUsers,
  sendMessage,
  deleteMessage,
  sendTyping,
  sendStopTyping,
  isMobile,
  onBack,
  onShowInvite,
  onMessageSent,
}: Props) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const convInfo = activeConv ? getConvInfo(activeConv, myId) : null;

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage(text, replyTo?.id);
    setInputText("");
    setReplyTo(null);
    sendStopTyping();
    onMessageSent();
  }, [inputText, replyTo, sendMessage, sendStopTyping, onMessageSent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendStopTyping(), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      sendMessage("", undefined, url);
      onMessageSent();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadApi.uploadFile(file);
      sendMessage("", undefined, undefined, {
        fileUrl: result.url,
        fileName: result.name,
        fileSize: result.size,
        mimeType: result.mimeType,
      });
      onMessageSent();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { day: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
      const day = formatDay(msg.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) {
        last.messages.push(msg);
      } else {
        groups.push({ day, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Lightbox images
  const chatImages = useMemo(
    () =>
      messages
        .filter((m) => m.imageUrl)
        .map((m) => ({ src: m.imageUrl!, caption: m.sender?.username ? `📸 ${m.sender.username}` : undefined })),
    [messages]
  );
  const lightboxIndex = useMemo(
    () => (lightboxUrl ? chatImages.findIndex((img) => img.src === lightboxUrl) : -1),
    [lightboxUrl, chatImages]
  );

  if (!activeConv) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[48px] mb-3">💬</div>
          <div className="font-serif text-[17px] text-text-1 mb-1">Izaberi razgovor</div>
          <div className="text-[13px] text-text-3">Klikni na razgovor s leve strane</div>
        </div>
      </div>
    );
  }

  const myMember = activeConv.members?.find((m) => m.userId === myId);
  const canInvite = myMember?.role === "admin" || myMember?.role === "chat_moderator";
  const isGroupLike = activeConv.type === "group" || activeConv.type === "community_room";

  const otherLastReadAt = activeConv.type === "dm"
    ? activeConv.members?.find((m) => m.userId !== myId)?.lastReadAt
    : undefined;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {lightboxUrl && lightboxIndex !== -1 && (
        <ImageLightbox
          images={chatImages}
          index={lightboxIndex}
          onClose={() => setLightboxUrl(null)}
          onPrev={() => setLightboxUrl(chatImages[Math.max(0, lightboxIndex - 1)].src)}
          onNext={() => setLightboxUrl(chatImages[Math.min(chatImages.length - 1, lightboxIndex + 1)].src)}
        />
      )}

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
        {isMobile && (
          <button onClick={onBack} className="text-text-3 bg-transparent border-none cursor-pointer">
            ←
          </button>
        )}
        <div
          onClick={() => convInfo?.user && navigate(`/u/${convInfo.user.username}`)}
          className={`w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent overflow-hidden shrink-0 border border-border ${convInfo?.user ? "cursor-pointer hover:opacity-80" : ""}`}
        >
          {convInfo?.avatar ? (
            <img loading="lazy" src={convInfo.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            convInfo?.initials ?? "?"
          )}
        </div>
        <div className="flex-1">
          <div
            onClick={() => convInfo?.user && navigate(`/u/${convInfo.user.username}`)}
            className={`text-[14px] font-semibold text-text-1 ${convInfo?.user ? "cursor-pointer hover:text-accent transition-colors" : ""}`}
          >
            {convInfo?.name ?? "Poruka"}
          </div>
          {activeConv.type === "dm" && convInfo?.user && (
            <div className="text-[11px] text-text-3">@{convInfo.user.username}</div>
          )}
          {isGroupLike && (
            <div className="text-[11px] text-text-3">
              {activeConv.members?.filter((m) => !m.leftAt).length ?? 0} članova
            </div>
          )}
        </div>
        {isGroupLike && canInvite && (
          <button
            onClick={onShowInvite}
            className="w-8 h-8 rounded-xl border border-border bg-surface flex items-center justify-center cursor-pointer text-text-2 hover:bg-accent-soft hover:text-accent transition-colors shrink-0"
            title="Dodaj u grupu"
          >
            <UserPlus size={15} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-surface-2" />
              <span className="text-[11px] text-text-3 shrink-0">{day}</span>
              <div className="flex-1 h-px bg-surface-2" />
            </div>
            {dayMsgs.map((msg) => {
              const isOwn = (msg.senderId ?? msg.sender?.id) === myId;
              const isRead = isOwn && !!otherLastReadAt && new Date(msg.createdAt) <= new Date(otherLastReadAt);
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  isRead={isRead}
                  onDelete={deleteMessage}
                  onImageClick={setLightboxUrl}
                />
              );
            })}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1 px-3 py-2 bg-surface-2 rounded-[14px] rounded-bl-[4px]">
              <span className="w-1.5 h-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div className="px-4 py-2 bg-accent-soft border-t border-border flex items-center justify-between">
          <div className="text-[12px] text-accent">
            ↩ Odgovaraš na: <span className="font-medium">{replyTo.content.slice(0, 60)}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-text-3 bg-transparent border-none cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <input ref={fileInputRef2} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Pošalji sliku"
          className="w-8 h-8 rounded-lg border border-border bg-surface text-text-3 cursor-pointer text-sm flex items-center justify-center shrink-0 hover:bg-surface-2 disabled:opacity-50"
        >
          📷
        </button>
        <button
          onClick={() => fileInputRef2.current?.click()}
          disabled={uploading}
          title="Pošalji fajl"
          className="w-8 h-8 rounded-lg border border-border bg-surface text-text-3 cursor-pointer flex items-center justify-center shrink-0 hover:bg-surface-2 disabled:opacity-50"
        >
          <FileText size={15} />
        </button>
        <input
          value={inputText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Napiši poruku..."
          className="flex-1 px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg font-sans"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() && !uploading}
          className="w-9 h-9 rounded-[10px] bg-accent text-white border-none cursor-pointer text-base flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
