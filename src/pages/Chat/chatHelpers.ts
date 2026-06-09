export const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });

export const formatDay = (date: string) =>
  new Date(date).toLocaleDateString("sr-RS", { day: "numeric", month: "long" });

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export type FileKind = "pdf" | "word" | "excel" | "ppt";

export const getFileKind = (mimeType?: string, fileName?: string): FileKind => {
  const m = mimeType ?? "";
  const n = fileName?.toLowerCase() ?? "";
  if (m === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (m.includes("spreadsheet") || m.includes("excel") || n.endsWith(".xls") || n.endsWith(".xlsx")) return "excel";
  if (m.includes("presentation") || m.includes("powerpoint") || n.endsWith(".ppt") || n.endsWith(".pptx")) return "ppt";
  return "word";
};

export const openFile = async (url: string, mimeType?: string, fileName?: string) => {
  const kind = getFileKind(mimeType, fileName);
  if (kind === "pdf") {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch {
      window.open(url, "_blank");
    }
  } else {
    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`, "_blank");
  }
};

export const downloadFile = async (url: string, fileName: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
};

/** Returns display name/avatar/initials for a conversation. */
export const getConvInfo = (conv: { type: string; isNotes?: boolean; name?: string | null; avatar?: string | null; members?: any[]; community?: any }, myId?: string) => {
  if (conv.type === "dm") {
    // Notes — DM sa samim sobom
    if (conv.isNotes) {
      const me = conv.members?.find((m) => m.userId === myId)?.user;
      return {
        name: "Beleške",
        avatar: me?.avatar ?? null,
        initials: "📝",
        user: me ?? null,
        isNotes: true,
      };
    }
    const other = conv.members?.find((m) => m.userId !== myId)?.user;
    return {
      name: other?.displayName || other?.username ?? "Direktna poruka",
      avatar: other?.avatar ?? null,
      initials: (other?.displayName || other?.username ?? "DM").slice(0, 2).toUpperCase(),
      user: other ?? null,
      isNotes: false,
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
