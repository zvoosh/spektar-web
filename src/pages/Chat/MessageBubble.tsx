import { memo } from "react";
import { CheckCheck, Download, FileText, FileSpreadsheet, Presentation, BookOpen } from "lucide-react";
import { formatTime, formatFileSize, getFileKind, openFile, downloadFile } from "./chatHelpers";
import type { Message } from "@/types";

type FileKind = "pdf" | "word" | "excel" | "ppt";

const FILE_META: Record<FileKind, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  pdf:   { label: "PDF",        icon: <BookOpen size={15} />,        bg: "bg-red-500/20",    text: "text-red-400" },
  word:  { label: "Word",       icon: <FileText size={15} />,        bg: "bg-blue-500/20",   text: "text-blue-400" },
  excel: { label: "Excel",      icon: <FileSpreadsheet size={15} />, bg: "bg-green-500/20",  text: "text-green-400" },
  ppt:   { label: "PowerPoint", icon: <Presentation size={15} />,    bg: "bg-orange-500/20", text: "text-orange-400" },
};

interface Props {
  message: Message;
  isOwn: boolean;
  isRead?: boolean;
  onDelete: (id: string) => void;
  onImageClick: (url: string) => void;
}

const MessageBubble = memo(({ message, isOwn, isRead, onDelete, onImageClick }: Props) => (
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
        <div className="text-[11px] px-3 py-1.5 rounded-lg mb-1 border-l-2 border-accent bg-surface-2 text-text-3 max-w-full">
          {message.replyTo.content}
        </div>
      )}

      {/* Image-only message (no bubble) */}
      {message.imageUrl && !message.content && !message.fileUrl && (
        <img
          src={message.imageUrl}
          alt=""
          onClick={() => onImageClick(message.imageUrl!)}
          className="rounded-xl max-w-[220px] cursor-zoom-in hover:opacity-90 transition-opacity block"
        />
      )}

      <div
        className={`px-3.5 py-2.5 rounded-[14px] text-[13px] leading-relaxed ${
          !message.content && !message.fileUrl && message.imageUrl ? "hidden" :
          isOwn
            ? "bg-accent-text text-white rounded-br-[4px]"
            : "bg-surface border border-border text-text-1 rounded-bl-[4px]"
        }`}
      >
        {message.imageUrl && message.content && (
          <img
            src={message.imageUrl}
            alt=""
            onClick={() => onImageClick(message.imageUrl!)}
            className="rounded-lg mb-1.5 max-w-[200px] cursor-zoom-in hover:opacity-90 transition-opacity"
          />
        )}
        {message.fileUrl && (() => {
          const kind = getFileKind(message.mimeType, message.fileName);
          const meta = FILE_META[kind];
          return (
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => openFile(message.fileUrl!, message.mimeType, message.fileName)}
                className={`flex items-center gap-2.5 px-1 py-0.5 rounded-lg bg-transparent border-none cursor-pointer flex-1 min-w-0 text-left ${isOwn ? "text-white/90 hover:text-white" : "text-text-2 hover:text-text-1"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOwn ? "bg-white/20" : meta.bg}`}>
                  <span className={isOwn ? "text-white" : meta.text}>{meta.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isOwn ? "text-white/50" : meta.text}`}>{meta.label}</div>
                  <div className="text-[12px] font-medium truncate max-w-[140px]">{message.fileName}</div>
                  {message.fileSize && (
                    <div className={`text-[10px] ${isOwn ? "text-white/50" : "text-text-3"}`}>{formatFileSize(message.fileSize)}</div>
                  )}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); downloadFile(message.fileUrl!, message.fileName ?? "file"); }}
                className={`shrink-0 opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer p-1 ${isOwn ? "text-white" : "text-text-2"}`}
                title="Preuzmi"
              >
                <Download size={14} />
              </button>
            </div>
          );
        })()}
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
));

export default MessageBubble;
