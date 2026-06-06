import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Share2, Link, Check, Twitter, Facebook, MessageCircle } from "lucide-react";

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
            <Twitter size={14} className="text-text-3 shrink-0" />
            X / Twitter
          </button>

          <button
            onClick={shareToFacebook}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-1 hover:bg-surface-2 bg-transparent border-none cursor-pointer transition-colors text-left"
          >
            <Facebook size={14} className="text-text-3 shrink-0" />
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
