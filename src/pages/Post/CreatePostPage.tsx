import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";
import { postsApi } from "@/api/posts";
import { uploadApi } from "@/api/upload";

const POST_TYPES = [
  { value: "discussion", label: "Diskusija", icon: "💬" },
  { value: "question", label: "Pitanje", icon: "❓" },
  { value: "event", label: "Događaj", icon: "📅" },
  { value: "recommendation", label: "Preporuka", icon: "⭐" },
  { value: "announcement", label: "Obaveštenje", icon: "📢" },
  { value: "photo", label: "Fotografija", icon: "📷" },
];

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCommunity = searchParams.get("community");

  const [type, setType] = useState("discussion");
  const [communityId, setCommunityId] = useState(preselectedCommunity ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [tags, setTags] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const { data: communitiesAll } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAll,
  });
  // Prikaži samo zajednice u kojima je korisnik član
  const communities = communitiesAll?.filter((c: any) => c.isMember);

  const createMutation = useMutation({
    mutationFn: () =>
      postsApi.create(communityId, {
        type: type as any,
        title,
        body: body || undefined,
        imageUrl: imageUrl || undefined,
        eventLocation: eventLocation || undefined,
        eventDate: eventDate || undefined,
        eventEndDate: eventEndDate || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    onSuccess: (post) => {
      navigate(`/post/${post.id}`);
    },
  });

  const isValid = title.trim().length > 0 && communityId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-text-3 bg-transparent border-none cursor-pointer hover:text-text-1"
        >
          ←
        </button>
        <h1 className="font-serif text-[22px] text-text-1">Novi post</h1>
      </div>

      <div className="bg-surface border border-border rounded-[14px] p-6 space-y-5">
        {/* Community */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Zajednica *
          </label>
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-surface font-sans appearance-none cursor-pointer"
          >
            <option value="">Izaberi zajednicu...</option>
            {communities?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Post type */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Tip posta
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.value}
                onClick={() => setType(pt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[13px] cursor-pointer transition-all min-w-0 ${
                  type === pt.value
                    ? "border-accent bg-accent-soft text-accent font-medium"
                    : "border-border bg-surface text-text-2 hover:border-accent/40"
                }`}
              >
                <span className="shrink-0">{pt.icon}</span>
                <span className="truncate">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Naslov *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Upiši naslov..."
            maxLength={200}
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[14px] text-text-1 outline-none focus:border-accent font-serif bg-surface"
          />
          <div className="text-right text-[11px] text-text-3 mt-1">{title.length}/200</div>
        </div>

        {/* Body */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Sadržaj
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Napiši više detalja... (opciono)"
            rows={5}
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-2 leading-relaxed outline-none focus:border-accent resize-none font-sans bg-surface"
          />
        </div>

        {/* Event date fields */}
        {type === "event" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
                Početak događaja
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
                Kraj događaja
              </label>
              <input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
              />
            </div>
          </div>
        )}

        {/* Lokacija — opciono za sve tipove */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Lokacija <span className="font-normal normal-case">(opciono)</span>
          </label>
          <input
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="npr. Kalemegdan, Beograd"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Slika
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-[300px] object-cover rounded-[10px] border border-border"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-[10px] flex items-center justify-center text-white text-[13px]">
                  Učitavam...
                </div>
              )}
              <button
                onClick={() => { setImagePreview(""); setImageUrl(""); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm border-none cursor-pointer flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-[10px] border border-dashed border-border text-[13px] text-text-3 bg-surface cursor-pointer hover:border-accent hover:text-accent transition-colors"
              >
                📷 Dodaj sliku sa računara
              </button>
            </div>
          )}
          {!imagePreview && (
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="ili unesi URL slike..."
              className="w-full mt-2 px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
            />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Tagovi
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="beograd, događaj, park (odvojeni zarezom)"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-surface"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2-2"
          >
            Otkaži
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!isValid || createMutation.isPending}
            className="px-6 py-2.5 rounded-[10px] bg-accent text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50"
          >
            {createMutation.isPending ? "Objavljujem..." : "Objavi post"}
          </button>
        </div>

        {createMutation.isError && (
          <div className="text-[13px] text-red-500 text-center">
            Greška pri objavljivanju. Pokušaj ponovo.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;
