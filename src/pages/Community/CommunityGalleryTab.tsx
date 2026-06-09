import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Check, X } from "lucide-react";
import { communitiesApi } from "@/api/communities";
import { uploadApi } from "@/api/upload";
import ImageLightbox from "@/components/shared/ImageLightbox";
import type { Community } from "@/types";

interface Props {
  community: Community;
  isMember: boolean;
  isMod: boolean;
}

const CommunityGalleryTab = ({ community, isMember, isMod }: Props) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: gallery, refetch: refetchGallery } = useQuery({
    queryKey: ["gallery", community.id],
    queryFn: () => communitiesApi.getGallery(community.id),
  });

  const { data: pendingGallery, refetch: refetchPending } = useQuery({
    queryKey: ["gallery-pending", community.id],
    queryFn: () => communitiesApi.getPendingGallery(community.id),
    enabled: isMod,
  });

  const approveImageMutation = useMutation({
    mutationFn: (imageId: string) => communitiesApi.approveGalleryImage(imageId),
    onSuccess: () => {
      toast.success("Slika odobrena");
      refetchGallery();
      refetchPending();
    },
    onError: () => toast.error("Odobravanje nije uspelo"),
  });

  const rejectImageMutation = useMutation({
    mutationFn: (imageId: string) => communitiesApi.rejectGalleryImage(imageId),
    onSuccess: () => {
      toast.success("Slika odbijena");
      refetchPending();
    },
    onError: () => toast.error("Odbijanje nije uspelo"),
  });

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      const { default: api } = await import("@/api/axios");
      await api.post(`/communities/${community.id}/gallery`, { imageUrl: url });
      toast.success(isMod ? "Slika dodata" : "Slika poslata na odobrenje");
      refetchGallery();
    } catch {
      toast.error("Upload nije uspeo");
    } finally {
      setGalleryUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isMember && (
        <div>
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={galleryUploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50 shadow-[0_2px_8px_rgba(26,138,87,0.3)]"
          >
            <ImagePlus size={15} strokeWidth={2.5} />
            {galleryUploading ? "Učitavam..." : "Dodaj sliku"}
          </button>
          {!isMod && (
            <p className="text-[11px] text-text-3 mt-1.5">
              Slike čekaju odobrenje moderatora pre prikazivanja.
            </p>
          )}
        </div>
      )}

      {/* Pending — samo mod/owner */}
      {isMod && (pendingGallery?.length ?? 0) > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="px-5 py-3.5 border-b border-surface-2 flex items-center gap-2">
            <span className="font-semibold text-[14px] text-text-1">Na čekanju</span>
            <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[11px] font-bold">
              {pendingGallery!.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {pendingGallery!.map((img: any) => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-border relative">
                <div className="aspect-square">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
                </div>
                <div className="p-2 bg-surface-2 border-t border-border">
                  <div className="text-[11px] text-text-3 truncate mb-1.5">od {img.uploadedBy?.username}</div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => approveImageMutation.mutate(img.id)}
                      disabled={approveImageMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-accent text-white text-[11px] font-semibold border-none cursor-pointer disabled:opacity-50"
                    >
                      <Check size={11} strokeWidth={3} /> Odobri
                    </button>
                    <button
                      onClick={() => rejectImageMutation.mutate(img.id)}
                      disabled={rejectImageMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-danger-soft text-danger text-[11px] font-semibold border-none cursor-pointer disabled:opacity-50"
                    >
                      <X size={11} strokeWidth={3} /> Odbij
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved gallery */}
      {!gallery?.length ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <div className="text-[40px] mb-3">🖼️</div>
          <div className="font-serif text-[15px] text-text-1 mb-1">Galerija je prazna</div>
          <div className="text-[13px] text-text-3">{isMember ? "Dodaj prvu sliku!" : "Nema slika još."}</div>
        </div>
      ) : (
        <>
          {lightboxIndex !== null && (
            <ImageLightbox
              images={gallery.map((img: any) => ({
                src: img.imageUrl,
                caption: img.uploadedBy?.username ? `📸 ${img.uploadedBy.username}` : undefined,
              }))}
              index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
              onNext={() => setLightboxIndex((i) => Math.min(gallery.length - 1, (i ?? 0) + 1))}
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((img: any, i: number) => (
              <div
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                className="aspect-square rounded-xl overflow-hidden border border-border group relative cursor-pointer"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title ?? ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {img.uploadedBy?.username && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[11px] text-white truncate">{img.uploadedBy.username}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityGalleryTab;
