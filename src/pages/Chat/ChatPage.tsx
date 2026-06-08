import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { chatApi } from "@/api/chat";
import { uploadApi } from "@/api/upload";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { useChat } from "@/hooks/useChat";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Conversation, Message, User } from "@/types";
import { useNavigate } from "react-router-dom";
import { PenSquare, Search, X, UserPlus, FileText, Download, CheckCheck } from "lucide-react";
import ImageLightbox from "@/components/shared/ImageLightbox";

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });

const formatDay = (date: string) =>
  new Date(date).toLocaleDateString("sr-RS", { day: "numeric", month: "long" });

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Izvlači prikaz ime/avatar za konverzaciju
const useConvInfo = (conv: Conversation, myId?: string) => {
  if (conv.type === "dm") {
    const other = conv.members?.find((m) => m.userId !== myId)?.user;
    return {
      name: other?.username ?? "Direktna poruka",
      avatar: other?.avatar ?? null,
      initials: (other?.username ?? "DM").slice(0, 2).toUpperCase(),
      user: other,
    };
  }
  const baseName = conv.name ?? "Opšti chat";
  const name = conv.type === "community_room" && conv.community?.name
    ? `${conv.community.name} — ${baseName}`
    : baseName;
  return {
    name,
    avatar: conv.avatar ?? conv.community?.avatar ?? null,
    initials: (conv.community?.name ?? baseName).slice(0, 2).toUpperCase(),
    user: null,
  };
};

const ConversationItem = ({
  conv,
  active,
  myId,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  myId?: string;
  onClick: () => void;
}) => {
  const info = useConvInfo(conv, myId);
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
};

const MessageBubble = ({
  message,
  isOwn,
  isRead,
  onDelete,
  onImageClick,
}: {
  message: Message;
  isOwn: boolean;
  isRead?: boolean;
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
}) => (
  <div className={`flex items-end gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
    {!isOwn && (
      <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-[10px] font-semibold text-accent shrink-0 overflow-hidden">
        {message.sender?.avatar ? (
          <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          message.sender?.username?.slice(0, 2).toUpperCase()
        )}
      </div>
    )}
    <div className={`max-w-[70%] group ${isOwn ? "items-end" : "items-start"} flex flex-col relative`}>
      {!isOwn && (
        <span className="text-[10px] text-text-3 mb-1 px-1">{message.sender?.username}</span>
      )}
      {message.replyTo && (
        <div className={`text-[11px] px-3 py-1.5 rounded-lg mb-1 border-l-2 border-accent bg-surface-2 text-text-3 max-w-full`}>
          {message.replyTo.content}
        </div>
      )}
      <div
        className={`px-3.5 py-2.5 rounded-[14px] text-[13px] leading-relaxed ${
          isOwn
            ? "bg-accent-text text-white rounded-br-[4px]"
            : "bg-surface border border-border text-text-1 rounded-bl-[4px]"
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt=""
            onClick={() => onImageClick(message.imageUrl!)}
            className="rounded-lg mb-1.5 max-w-[200px] cursor-zoom-in hover:opacity-90 transition-opacity"
          />
        )}
        {message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 px-1 py-0.5 rounded-lg no-underline group/file ${isOwn ? "text-white/90 hover:text-white" : "text-text-2 hover:text-text-1"}`}
            download={message.fileName}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? "bg-white/20" : "bg-surface-2"}`}>
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate max-w-[160px]">{message.fileName}</div>
              {message.fileSize && (
                <div className={`text-[10px] ${isOwn ? "text-white/60" : "text-text-3"}`}>{formatFileSize(message.fileSize)}</div>
              )}
            </div>
            <Download size={13} className="shrink-0 opacity-60 group-hover/file:opacity-100" />
          </a>
        )}
        {message.content}
      </div>
      {isOwn && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(message.id); }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[9px] border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 shadow-sm"
          title="Obriši poruku"
        >
          ✕
        </button>
      )}
      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : ""}`}>
        <span className="text-[10px] text-text-3">{formatTime(message.createdAt)}</span>
        {isOwn && (
          <CheckCheck size={12} className={isRead ? "text-accent" : "text-text-3"} />
        )}
      </div>
    </div>
  </div>
);

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

const NewChatModal = ({ onClose, onStart }: { onClose: () => void; onStart: (conv: Conversation) => void }) => {
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

        {/* Mode tabs */}
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

          {/* Selected chips for group */}
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

// Modal za invitovanje u postojeću konverzaciju
const InviteModal = ({ conversationId, onClose }: { conversationId: string; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const { data: users } = useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => usersApi.search(q),
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
              <UserRow
                key={u.id}
                u={u}
                onClick={() => inviteMutation.mutate(u.id)}
              />
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

const ChatPage = () => {
  const { user } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [pendingConv, setPendingConv] = useState<Conversation | null>(null);
  const [showList, setShowList] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatApi.getConversations,
    refetchInterval: 30_000,
  });

  const { messages, setMessages, typingUsers, sendMessage, sendTyping, sendStopTyping, deleteMessage: deleteMessageSocket, markAsRead } =
    useChat(activeConvId);

  const deleteMessage = async (messageId: string) => {
    // Odmah ukloni iz UI-a
    deleteMessageSocket(messageId);
    try {
      // HTTP DELETE — pouzdaniji od WebSocket emita
      await chatApi.deleteMessage(messageId);
      setTimeout(() => refetchConversations(), 300);
    } catch {
      // ignorisi — WebSocket je vec uklonio iz lokalnog stanja
    }
  };

  const activeConv = conversations?.find((c) => c.id === activeConvId) ?? (pendingConv?.id === activeConvId ? pendingConv : null);
  const activeConvInfo = activeConv ? (() => {
    if (activeConv.type === "dm") {
      const other = activeConv.members?.find((m) => m.userId !== user?.id)?.user;
      return { name: other?.username ?? "Direktna poruka", avatar: other?.avatar ?? null, initials: (other?.username ?? "DM").slice(0, 2).toUpperCase(), user: other };
    }
    const baseName = activeConv.name ?? "Opšti chat";
    const name = activeConv.type === "community_room" && activeConv.community?.name
      ? `${activeConv.community.name} — ${baseName}`
      : baseName;
    return { name, avatar: activeConv.avatar ?? null, initials: (activeConv.community?.name ?? baseName).slice(0, 2).toUpperCase(), user: null };
  })() : null;

  // Load history when switching conversations
  useEffect(() => {
    if (!activeConvId) return;
    chatApi.getMessages(activeConvId).then(({ messages: hist }) => {
      setMessages(hist);
      markAsRead();
    });
  }, [activeConvId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage(text, replyTo?.id);
    setInputText("");
    setReplyTo(null);
    sendStopTyping();
    refetchConversations();
  }, [inputText, replyTo, sendMessage, sendStopTyping, refetchConversations]);

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
    setImageUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      sendMessage("", undefined, url);
      refetchConversations();
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const result = await uploadApi.uploadFile(file);
      sendMessage("", undefined, undefined, {
        fileUrl: result.url,
        fileName: result.name,
        fileSize: result.size,
        mimeType: result.mimeType,
      });
      refetchConversations();
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const openConv = (convId: string, conv?: Conversation) => {
    setActiveConvId(convId);
    if (conv) setPendingConv(conv);
    if (isMobile) setShowList(false);
  };

  // Group messages by day
  const groupedMessages: { day: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const day = formatDay(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.day === day) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ day, messages: [msg] });
    }
  });

  const showSidebar = !isMobile || showList;
  const showChat = !isMobile || !showList;

  // Sve slike u trenutnoj konverzaciji (za prev/next u lightboxu)
  const chatImages = messages
    .filter((m) => m.imageUrl)
    .map((m) => ({ src: m.imageUrl!, caption: m.sender?.username ? `📸 ${m.sender.username}` : undefined }));
  const lightboxIndex = lightboxUrl ? chatImages.findIndex((img) => img.src === lightboxUrl) : -1;

  return (
    <div className="flex bg-surface border border-border rounded-[14px] overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
      {lightboxUrl && lightboxIndex !== -1 && (
        <ImageLightbox
          images={chatImages}
          index={lightboxIndex}
          onClose={() => setLightboxUrl(null)}
          onPrev={() => setLightboxUrl(chatImages[Math.max(0, lightboxIndex - 1)].src)}
          onNext={() => setLightboxUrl(chatImages[Math.min(chatImages.length - 1, lightboxIndex + 1)].src)}
        />
      )}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onStart={(conv) => {
            refetchConversations();
            setShowNewChat(false);
            openConv(conv.id, conv);
          }}
        />
      )}
      {showInvite && activeConvId && (
        <InviteModal
          conversationId={activeConvId}
          onClose={() => setShowInvite(false)}
        />
      )}
      {/* Conversations list */}
      {showSidebar && (
        <div className={`${isMobile ? "w-full" : "w-72"} border-r border-border flex flex-col shrink-0`}>
          <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-[15px] text-text-1">Poruke</span>
            <button
              onClick={() => setShowNewChat(true)}
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
                myId={user?.id}
                onClick={() => openConv(conv.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      {showChat && (
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[48px] mb-3">💬</div>
                <div className="font-serif text-[17px] text-text-1 mb-1">Izaberi razgovor</div>
                <div className="text-[13px] text-text-3">Klikni na razgovor s leve strane</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setShowList(true)}
                    className="text-text-3 bg-transparent border-none cursor-pointer"
                  >
                    ←
                  </button>
                )}
                <div
                  onClick={() => activeConvInfo?.user && navigate(`/u/${activeConvInfo.user.username}`)}
                  className={`w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent overflow-hidden shrink-0 border border-border ${activeConvInfo?.user ? "cursor-pointer hover:opacity-80" : ""}`}
                >
                  {activeConvInfo?.avatar ? (
                    <img src={activeConvInfo.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    activeConvInfo?.initials ?? "?"
                  )}
                </div>
                <div className="flex-1">
                  <div
                    onClick={() => activeConvInfo?.user && navigate(`/u/${activeConvInfo.user.username}`)}
                    className={`text-[14px] font-semibold text-text-1 ${activeConvInfo?.user ? "cursor-pointer hover:text-accent transition-colors" : ""}`}
                  >
                    {activeConvInfo?.name ?? "Poruka"}
                  </div>
                  {activeConv?.type === "dm" && activeConvInfo?.user && (
                    <div className="text-[11px] text-text-3">@{activeConvInfo.user.username}</div>
                  )}
                  {(activeConv?.type === "group" || activeConv?.type === "community_room") && (
                    <div className="text-[11px] text-text-3">
                      {activeConv.members?.filter(m => !m.leftAt).length ?? 0} članova
                    </div>
                  )}
                </div>
                {(activeConv?.type === "group" || activeConv?.type === "community_room") && (() => {
                  const myMember = activeConv.members?.find((m) => m.userId === user?.id);
                  const canInvite = myMember?.role === "admin" || myMember?.role === "chat_moderator";
                  return canInvite ? (
                    <button
                      onClick={() => setShowInvite(true)}
                      className="w-8 h-8 rounded-xl border border-border bg-surface flex items-center justify-center cursor-pointer text-text-2 hover:bg-accent-soft hover:text-accent transition-colors shrink-0"
                      title="Dodaj u grupu"
                    >
                      <UserPlus size={15} strokeWidth={2} />
                    </button>
                  ) : null;
                })()}
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
                    {(() => {
                      // Read receipts: kada je drugi korisnik poslednji pročitao (samo za DM)
                      const otherLastReadAt = activeConv?.type === "dm"
                        ? activeConv.members?.find((m) => m.userId !== user?.id)?.lastReadAt
                        : undefined;
                      return dayMsgs.map((msg) => {
                        const isOwn = (msg.senderId ?? msg.sender?.id) === user?.id;
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
                      });
                    })()}
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
                <input ref={fileInputRef2} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  title="Pošalji sliku"
                  className="w-8 h-8 rounded-lg border border-border bg-surface text-text-3 cursor-pointer text-sm flex items-center justify-center shrink-0 hover:bg-surface-2 disabled:opacity-50"
                >
                  📷
                </button>
                <button
                  onClick={() => fileInputRef2.current?.click()}
                  disabled={imageUploading}
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
                  disabled={!inputText.trim() && !imageUploading}
                  className="w-9 h-9 rounded-[10px] bg-accent text-white border-none cursor-pointer text-base flex items-center justify-center shrink-0 disabled:opacity-40"
                >
                  ↑
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
