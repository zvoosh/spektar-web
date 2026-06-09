import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { communitiesApi } from "@/api/communities";
import { uploadApi } from "@/api/upload";
import type { Community } from "@/types";

interface Props {
  community: Community;
  slug: string;
  onClose: () => void;
}

const CommunityEditModal = ({ community, slug, onClose }: Props) => {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(community.name ?? "");
  const [description, setDescription] = useState(community.description ?? "");
  const [location, setLocation] = useState((community as any).location ?? "");
  const [type, setType] = useState((community as any).type ?? "public");
  const [category, setCategory] = useState((community as any).category ?? "other");
  const [avatarUrl, setAvatarUrl] = useState(community.avatar ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof communitiesApi.update>[1]) =>
      communitiesApi.update(community.id, data),
    onSuccess: () => {
      toast.success("Zajednica je ažurirana");
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      onClose();
    },
    onError: () => toast.error("Ažuriranje nije uspelo"),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setAvatarUrl(url);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <span className="font-semibold text-[15px] text-text-1">Uredi zajednicu</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-14 h-14 rounded-xl bg-accent-soft border-2 border-dashed border-accent/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-accent transition-colors shrink-0"
            >
              {avatarUrl ? (
                <img loading="lazy" src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={20} className="text-accent/50" />
              )}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <div>
              <div className="text-[13px] font-medium text-text-1">Avatar zajednice</div>
              <div className="text-[11px] text-text-3 mt-0.5">
                {avatarUploading ? "Učitavam..." : "Klikni da promeniš"}
              </div>
            </div>
          </div>

          {/* Naziv */}
          <div>
            <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Naziv</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent font-serif bg-surface"
            />
          </div>

          {/* Opis */}
          <div>
            <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Opis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-2 outline-none focus:border-accent resize-none font-sans bg-surface"
            />
          </div>

          {/* Lokacija */}
          <div>
            <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Lokacija</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="npr. Vračar, Beograd"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
            />
          </div>

          {/* Vidljivost + Kategorija */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Vidljivost</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-surface cursor-pointer"
              >
                <option value="public">Javna</option>
                <option value="restricted">Ograničena</option>
                <option value="private">Privatna</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Kategorija</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-surface cursor-pointer"
              >
                <option value="neighborhood">Kvart / Komšiluk</option>
                <option value="hobby">Hobi</option>
                <option value="sport">Sport</option>
                <option value="food">Hrana i piće</option>
                <option value="events">Događaji</option>
                <option value="other">Ostalo</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-surface-2 border border-border p-3 text-[12px] text-text-3 leading-relaxed">
            <strong className="text-text-2">Napomena o vidljivosti:</strong> Javna — svi vide; Ograničena — svi vide, pridruživanje na poziv; Privatna — samo pozvani vide.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2-2"
            >
              Otkaži
            </button>
            <button
              onClick={() =>
                updateMutation.mutate({
                  name: name || undefined,
                  description: description || undefined,
                  location: location || undefined,
                  avatar: avatarUrl || undefined,
                  type,
                  category,
                })
              }
              disabled={updateMutation.isPending || !name.trim()}
              className="px-5 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {updateMutation.isPending ? "Čuvam..." : "Sačuvaj promene"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityEditModal;
