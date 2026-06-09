import { memo, useState, useRef, useCallback } from "react";
import { uploadApi } from "@/api/upload";
import { Camera, ImagePlus } from "lucide-react";
import type { User } from "@/types";

interface Props {
  user: User;
  myPostsCount: number;
  friendsCount: number;
  joinedDate: string;
  onUpdateProfile: (data: {
    bio?: string | undefined;
    avatar?: string | undefined;
    banner?: string | undefined;
  }) => Promise<User>;
  isSaving: boolean;
  onFriendsClick: () => void;
}

const ProfileHeader = memo(
  ({
    user,
    myPostsCount,
    friendsCount,
    joinedDate,
    onUpdateProfile,
    isSaving,
    onFriendsClick,
  }: Props) => {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleToggleEdit = useCallback(() => {
      setEditing((v) => !v);
      setBio(user.bio ?? "");
    }, [user.bio]);

    const handleSaveBio = useCallback(async () => {
      await onUpdateProfile({ bio });
      setEditing(false);
    }, [bio, onUpdateProfile]);

    const handleBannerChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerUploading(true);
        try {
          const url = await uploadApi.uploadImage(file);
          await onUpdateProfile({ banner: url });
        } finally {
          setBannerUploading(false);
        }
      },
      [onUpdateProfile],
    );

    const handleAvatarChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
          const url = await uploadApi.uploadImage(file);
          await onUpdateProfile({ avatar: url });
        } finally {
          setAvatarUploading(false);
        }
      },
      [onUpdateProfile],
    );

    return (
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Banner */}
        <div className="relative h-32 group overflow-hidden">
          {user.banner ? (
            <img
              src={user.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0d4f2e] via-[#1a8a57] to-[#3ab878]" />
          )}
          {bannerUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-surface border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
          />
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-[12px] border border-white/20 cursor-pointer backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
          >
            <ImagePlus size={13} />
            Promeni baner
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-accent-soft border-4 border-surface flex items-center justify-center text-xl font-bold text-accent cursor-pointer overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.username.slice(0, 2).toUpperCase()
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-accent border-2 border-surface flex items-center justify-center cursor-pointer pointer-events-none">
                <Camera size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <button
              onClick={handleToggleEdit}
              className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-text-2 bg-surface cursor-pointer hover:bg-surface-2-2 transition-colors"
            >
              {editing ? "Otkaži" : "Uredi profil"}
            </button>
          </div>

          {/* Name + info */}
          <div className="mb-3">
            <h1 className="font-serif text-[20px] text-text-1 leading-tight">
              {user.displayName || user.username}
            </h1>
            {user.displayName && (
              <div className="text-[12px] text-text-3 mt-0.5">
                @{user.username}
              </div>
            )}
            <div className="text-[12px] text-text-3 mt-0.5">{user.email}</div>
          </div>

          {/* Location */}
          {user.location && (
            <div className="flex items-center gap-1.5 text-[12px] text-text-3 mb-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {user.location}
            </div>
          )}

          {/* Bio */}
          {!editing && (
            <p className="text-[13px] text-text-2 leading-relaxed mb-4">
              {user.bio || (
                <span className="italic text-text-3">
                  Nema opisa. Klikni "Uredi profil".
                </span>
              )}
            </p>
          )}

          {editing && (
            <div className="mb-4 space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Napiši nešto o sebi..."
                rows={3}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-2 leading-relaxed outline-none focus:border-accent resize-none font-sans bg-surface"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-3">
                  {bio.length}/300
                </span>
                <button
                  onClick={handleSaveBio}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Čuvam..." : "Sačuvaj"}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-surface-2">
            <div>
              <div className="text-[18px] font-bold text-text-1">
                {myPostsCount}
              </div>
              <div className="text-[11px] text-text-3 font-medium">postova</div>
            </div>
            <div
              onClick={onFriendsClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="text-[18px] font-bold text-text-1">
                {friendsCount}
              </div>
              <div className="text-[11px] text-text-3 font-medium">
                prijatelja
              </div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-accent">
                {user.karma}
              </div>
              <div className="text-[11px] text-text-3 font-medium">karma</div>
            </div>
            <div className="sm:ml-auto text-[11px] sm:text-[12px] text-text-3">
              Član od {joinedDate}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ProfileHeader;
