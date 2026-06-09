import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";
import { chatApi } from "@/api/chat";
import { useAuthStore } from "@/store/authStore";
import { useChat } from "@/hooks/useChat";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Conversation } from "@/types";

import ConversationsSidebar from "./ConversationsSidebar";
import ChatArea from "./ChatArea";
import NewChatModal from "./NewChatModal";
import ChatInviteModal from "./ChatInviteModal";

const ChatPage = () => {
  const { user } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const { conversationId: urlConvId } = useParams<{ conversationId?: string }>();
  const location = useLocation();
  const navConv: Conversation | null = location.state?.conversation ?? null;

  const [activeConvId, setActiveConvId] = useState<string | null>(urlConvId ?? null);
  const [pendingConv, setPendingConv] = useState<Conversation | null>(navConv);
  const [showList, setShowList] = useState(!urlConvId);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatApi.getConversations,
    refetchInterval: 30_000,
  });

  const {
    messages,
    setMessages,
    typingUsers,
    sendMessage,
    sendTyping,
    sendStopTyping,
    deleteMessage: deleteMessageSocket,
    markAsRead,
  } = useChat(activeConvId);

  // Kada se URL promeni (navigacija sa druge stranice), otvori tu konverzaciju
  useEffect(() => {
    if (urlConvId && urlConvId !== activeConvId) {
      setActiveConvId(urlConvId);
      if (isMobile) setShowList(false);
    }
  }, [urlConvId]);

  // Load history when switching conversations
  useEffect(() => {
    if (!activeConvId) return;
    chatApi.getMessages(activeConvId).then(({ messages: hist }) => {
      setMessages(hist);
      markAsRead();
    });
  }, [activeConvId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    deleteMessageSocket(messageId);
    try {
      await chatApi.deleteMessage(messageId);
      setTimeout(() => refetchConversations(), 300);
    } catch {
      // WebSocket already removed from local state
    }
  }, [deleteMessageSocket, refetchConversations]);

  const openConv = useCallback((convId: string, conv?: Conversation) => {
    setActiveConvId(convId);
    if (conv) setPendingConv(conv);
    if (isMobile) setShowList(false);
  }, [isMobile]);

  const handleMessageSent = useCallback(() => refetchConversations(), [refetchConversations]);
  const handleBack        = useCallback(() => setShowList(true), []);
  const handleShowInvite  = useCallback(() => setShowInvite(true), []);
  const handleCloseInvite = useCallback(() => setShowInvite(false), []);
  const handleNewChat     = useCallback(() => setShowNewChat(true), []);
  const handleCloseNewChat = useCallback(() => setShowNewChat(false), []);
  const handleNewChatStart = useCallback((conv: Conversation) => {
    refetchConversations();
    setShowNewChat(false);
    openConv(conv.id, conv);
  }, [refetchConversations, openConv]);

  const activeConv =
    conversations?.find((c) => c.id === activeConvId) ??
    (pendingConv?.id === activeConvId ? pendingConv : null);

  const showSidebar = !isMobile || showList;
  const showChat = !isMobile || !showList;

  return (
    <div className="flex bg-surface border border-border rounded-[14px] overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
      {showNewChat && (
        <NewChatModal
          onClose={handleCloseNewChat}
          onStart={handleNewChatStart}
        />
      )}
      {showInvite && activeConvId && (
        <ChatInviteModal
          conversationId={activeConvId}
          onClose={handleCloseInvite}
        />
      )}

      {showSidebar && (
        <ConversationsSidebar
          conversations={conversations}
          activeConvId={activeConvId}
          myId={user?.id}
          isMobile={isMobile}
          onOpenConv={openConv}
          onNewChat={handleNewChat}
        />
      )}

      {showChat && (
        <ChatArea
          activeConv={activeConv ?? null}
          myId={user?.id}
          messages={messages}
          typingUsers={typingUsers}
          sendMessage={sendMessage}
          deleteMessage={deleteMessage}
          sendTyping={sendTyping}
          sendStopTyping={sendStopTyping}
          isMobile={isMobile}
          onBack={handleBack}
          onShowInvite={handleShowInvite}
          onMessageSent={handleMessageSent}
        />
      )}
    </div>
  );
};

export default ChatPage;
