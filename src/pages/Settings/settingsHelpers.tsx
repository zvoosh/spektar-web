export const DEFAULT_NOTIF_PREFS = {
  comments: true,
  upvotes: true,
  friends: true,
  messages: true,
};

export const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-10 h-5.5 rounded-full border-none cursor-pointer transition-colors shrink-0 ${value ? "bg-accent" : "bg-surface-2"}`}
    style={{ height: "22px", width: "40px" }}
  >
    <span
      className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all"
      style={{ left: value ? "20px" : "3px" }}
    />
  </button>
);
