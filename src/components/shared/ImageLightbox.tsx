import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: { src: string; caption?: string }[];
  index: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const ImageLightbox = ({ images, index, onClose, onPrev, onNext }: Props) => {
  const img = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    },
    [onClose, hasPrev, hasNext, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!img) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center cursor-pointer text-white transition-colors z-10"
      >
        <X size={18} />
      </button>

      {/* Prev */}
      {hasPrev && onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center cursor-pointer text-white transition-colors z-10"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next */}
      {hasNext && onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center cursor-pointer text-white transition-colors z-10"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.src}
          alt={img.caption ?? ""}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
        {img.caption && (
          <div className="text-[13px] text-white/70 text-center max-w-lg">
            {img.caption}
          </div>
        )}
        {images.length > 1 && (
          <div className="text-[12px] text-white/40">
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageLightbox;
