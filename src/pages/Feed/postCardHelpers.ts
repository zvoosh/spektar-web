export const POST_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  announcement:  { label: "Obaveštenje", color: "#c4622d", bg: "#fdf3ee", dot: "#e8845a" },
  discussion:    { label: "Diskusija",   color: "#2d5fa8", bg: "#eef3fc", dot: "#5b8ad6" },
  event:         { label: "Događaj",    color: "#1a8a57", bg: "#e8f8f0", dot: "#3ab878" },
  recommendation:{ label: "Preporuka",  color: "#7c5c1e", bg: "#fdf6e8", dot: "#c49a3c" },
  photo:         { label: "Fotografija",color: "#6b2d7a", bg: "#f5eaf8", dot: "#a055b8" },
  question:      { label: "Pitanje",    color: "#2d5fa8", bg: "#eef3fc", dot: "#5b8ad6" },
};

export const formatDate = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};
