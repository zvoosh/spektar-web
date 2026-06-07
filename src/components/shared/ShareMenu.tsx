import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Share2, Link, Check, MessageCircle } from "lucide-react";

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ShareMenuProps {
  url: string;
  title?: string;
  text?: string;
  onShare?: () => void;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

const ShareMenu = ({ url, title, text, onShare, className = "", label = "Podeli", showLabel = true }: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Zatvori na klik van
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Na mobilnom — direktno Web Share API ako postoji
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
      onShare?.();
      return;
    }

    // Desktop — pozicioniraj dropdown
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 180;
      setMenuPos({
        top: spaceBelow > menuHeight
          ? rect.bottom + window.scrollY + 6
          : rect.top + window.scrollY - menuHeight - 6,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 200),
      });
    }
    setOpen((v) => !v);
  };

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    onShare?.();
    setOpen(false);
  };

  const shareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = encodeURIComponent(title ?? text ?? "");
    const u = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank", "noopener");
    onShare?.();
    setOpen(false);
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const u = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener");
    onShare?.();
    setOpen(false);
  };

  const shareToViber = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = encodeURIComponent(`${title ?? ""} ${url}`);
    window.open(`viber://forward?text=${t}`, "_blank", "noopener");
    onShare?.();
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] bg-transparent border-none cursor-pointer transition-all font-medium ${
          copied ? "text-accent" : "text-text-3 hover:text-text-1 hover:bg-surface-2"
        } ${className}`}
      >
        {copied
          ? <Check size={14} strokeWidth={2.5} />
          : <Share2 size={14} strokeWidth={2} />
        }
        {showLabel && <span>{copied ? "Kopirano!" : label}</span>}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "absolute", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="w-48 bg-surface border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-1.5 overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-border mb-1">
            <div className="text-[11px] text-text-3 font-semibold uppercase tracking-wider">Podeli link</div>
          </div>

          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-1 hover:bg-surface-2 bg-transparent border-none cursor-pointer transition-colors text-left"
          >
            <Link size={14} className="text-text-3 shrink-0" />
            Kopiraj link
          </button>

          <button
            onClick={shareToTwitter}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-1 hover:bg-surface-2 bg-transparent border-none cursor-pointer transition-colors text-left"
          >
            <span className="text-text-3 shrink-0"><XIcon /></span>
            X / Twitter
          </button>

          <button
            onClick={shareToFacebook}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-1 hover:bg-surface-2 bg-transparent border-none cursor-pointer transition-colors text-left"
          >
            <span className="text-text-3 shrink-0"><FacebookIcon /></span>
            Facebook
          </button>

          <button
            onClick={shareToViber}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-1 hover:bg-surface-2 bg-transparent border-none cursor-pointer transition-colors text-left"
          >
            <MessageCircle size={14} className="text-text-3 shrink-0" />
            Viber
          </button>
        </div>,
        document.body
      )}
    </>
  );
};

export default ShareMenu;
