import { memo, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, UserPlus, Pencil, Trash2, LogOut } from "lucide-react";
import { communitiesApi } from "@/api/communities";
import { uploadApi } from "@/api/upload";
import type { Community } from "@/types";

const TYPE_SR: Record<string, string> = {
  public: "Javna",
  restricted: "Ograničena",
  private: "Privatna",
};

interface Props {
  community: Community;
  slug: string;
  isMember: boolean;
  isInvited: boolean;
  isOwner: boolean;
  isOwnerOrMod: boolean;
  isAuthenticated: boolean;
  // mutation state
  joinPending: boolean;
  leavePending: boolean;
  acceptPending: boolean;
  rejectPending: boolean;
  deletePending: boolean;
  // handlers
  onJoin: () => void;
  onLeave: () => void;
  onAcceptInvite: () => void;
  onRejectInvite: () => void;
  onDelete: () => void;
  onShowInvite: () => void;
  onShowEdit: () => void;
  onShowLeaveModal: () => void;
}

const CommunityBanner = memo(({
  community, slug,
  isMember, isInvited, isOwner, isOwnerOrMod, isAuthenticated,
  joinPending, leavePending, acceptPending, rejectPending, deletePending,
  onJoin, onLeave, onAcceptInvite, onRejectInvite, onDelete,
  onShowInvite, onShowEdit, onShowLeaveModal,
}: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      await communitiesApi.updateBanner(community.id, url);
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
    } finally {
      setBannerUploading(false);
    }
  };

  const handleLeaveClick = useCallback(() => {
    if (isOwner) {
      onShowLeaveModal();
    } else if (window.confirm("Napustiti ovu zajednicu?")) {
      onLeave();
    }
  }, [isOwner, onShowLeaveModal, onLeave]);

  const handleDeleteClick = useCallback(() => {
    if (window.confirm(`Obrisati zajednicu "${community.name}"? Ova akcija je nepovratna.`)) {
      onDelete();
    }
  }, [community.name, onDelete]);

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => {
    const btnBase = compact
      ? "px-3 py-1.5 rounded-lg text-[12px]"
      : "px-4 py-2 rounded-xl text-[13px]";
    const iconBtn = compact ? "w-7 h-7 rounded-lg" : "w-9 h-9 rounded-xl";

    return (
      <>
        {isMember ? (
          <>
            <span className={`${btnBase} bg-white/15 text-white border border-white/25 backdrop-blur-sm`}>
              ✓ Član
            </span>
            <button
              onClick={handleLeaveClick}
              disabled={leavePending}
              title="Napusti zajednicu"
              className={`${compact ? "w-7 h-7 rounded-lg" : "flex items-center gap-1.5 px-3 py-2 rounded-xl"} bg-white/10 hover:bg-red-500/40 text-white border border-white/20 cursor-pointer backdrop-blur-sm transition-colors disabled:opacity-50`}
            >
              <LogOut size={compact ? 12 : 14} />
              {!compact && <span>Napusti</span>}
            </button>
          </>
        ) : isInvited ? (
          <>
            <button
              onClick={onAcceptInvite}
              disabled={acceptPending || rejectPending}
              className={`${btnBase} bg-accent hover:bg-accent-hover text-white font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors`}
            >
              {acceptPending ? "..." : "✓ Prihvati poziv"}
            </button>
            <button
              onClick={onRejectInvite}
              disabled={acceptPending || rejectPending}
              className={`${btnBase} bg-white/15 hover:bg-red-500/40 text-white border border-white/25 cursor-pointer backdrop-blur-sm transition-colors`}
            >
              {rejectPending ? "..." : "✕ Odbij"}
            </button>
          </>
        ) : (community as any).type === "public" ? (
          <button
            onClick={() =>
              isAuthenticated
                ? onJoin()
                : navigate("/login", { state: { from: { pathname: `/c/${slug}` } } })
            }
            disabled={joinPending}
            className={`${btnBase} bg-accent hover:bg-accent-hover text-white font-semibold border-none cursor-pointer disabled:opacity-60 shadow-[0_2px_12px_rgba(26,138,87,0.4)] transition-colors`}
          >
            {joinPending ? "..." : "Pridruži se"}
          </button>
        ) : null}

        {isMember && (
          <button
            onClick={() => navigate(`/new-post?community=${community.id}`)}
            className={`${btnBase} bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm transition-colors`}
          >
            + Objavi
          </button>
        )}

        {isOwnerOrMod && (
          <>
            <button
              onClick={onShowInvite}
              className={`${compact ? "w-7 h-7 rounded-lg flex items-center justify-center" : "flex items-center gap-1.5 px-3 py-2 rounded-xl"} bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm transition-colors`}
            >
              <UserPlus size={compact ? 13 : 14} />
              {!compact && <span>Pozovi</span>}
            </button>
            <button
              onClick={onShowEdit}
              className={`${iconBtn} bg-white/15 hover:bg-white/25 text-white border border-white/25 cursor-pointer backdrop-blur-sm flex items-center justify-center transition-colors`}
            >
              <Pencil size={compact ? 13 : 14} />
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                disabled={deletePending}
                className={`${compact ? "w-7 h-7 rounded-lg flex items-center justify-center" : "flex items-center gap-1.5 px-3 py-2 rounded-xl"} bg-red-500/20 hover:bg-red-500/40 text-white border border-red-400/30 cursor-pointer backdrop-blur-sm transition-colors disabled:opacity-50`}
              >
                <Trash2 size={compact ? 13 : 14} />
                {!compact && <span>Obriši</span>}
              </button>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-5 h-52 shadow-[0_4px_20px_rgba(0,0,0,0.12)] group">
      {community.banner ? (
        <img src={community.banner} alt={community.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0d4f2e] via-[#1a8a57] to-[#3ab878]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {isOwnerOrMod && (
        <>
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-white text-[12px] border border-white/20 cursor-pointer backdrop-blur-sm hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Camera size={13} />
            {bannerUploading ? "Učitavam..." : "Promeni sliku"}
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-end gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden backdrop-blur-sm">
            {community.avatar ? (
              <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              community.name.slice(0, 1)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h1 className="font-serif text-[18px] sm:text-[22px] text-white leading-tight truncate">
                {community.name}
              </h1>
              {(community as any).type !== "public" && (
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm shrink-0">
                  🔒 {TYPE_SR[(community as any).type]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-[12px] text-white/80">
                {community.membersCount.toLocaleString("sr-RS")} članova
              </span>
              {(community as any).location && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-[11px] sm:text-[12px] text-white/70 truncate">
                    📍 {(community as any).location}
                  </span>
                </>
              )}
            </div>
            {/* Mobile actions */}
            <div className="flex gap-1.5 mt-2 sm:hidden flex-wrap">
              <ActionButtons compact />
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <ActionButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

});

export default CommunityBanner;
