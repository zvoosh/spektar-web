import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "Kvart / Komšiluk", value: "neighborhood" },
  { label: "Hobi", value: "hobby" },
  { label: "Sport", value: "sport" },
  { label: "Hrana i piće", value: "food" },
  { label: "Događaji", value: "events" },
  { label: "Ostalo", value: "other" },
];

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"public" | "restricted" | "private">("public");
  const [location, setLocation] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      communitiesApi.create({ name, description, category, type, location: location || undefined }),
    onSuccess: (community) => {
      navigate(`/c/${community.slug}`);
    },
  });

  const isValid = name.trim().length >= 3 && category;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-text-3 bg-transparent border-none cursor-pointer hover:text-text-1"
        >
          ←
        </button>
        <h1 className="font-serif text-[22px] text-text-1">Kreiraj zajednicu</h1>
      </div>

      <div className="bg-white border border-border rounded-[14px] p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Naziv zajednice *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Vračar zajednica"
            maxLength={50}
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[14px] text-text-1 outline-none focus:border-accent font-serif bg-white"
          />
          <div className="text-right text-[11px] text-text-3 mt-1">{name.length}/50</div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Opis
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opiši šta je svrha ove zajednice..."
            rows={3}
            maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-2 leading-relaxed outline-none focus:border-accent resize-none font-sans bg-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Kategorija *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3.5 py-1.75 rounded-full text-[13px] border cursor-pointer transition-all ${
                  category === cat.value
                    ? "border-accent bg-accent text-white font-medium"
                    : "border-border bg-white text-text-2 hover:border-accent/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Tip zajednice
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "public", label: "Javna", desc: "Svi mogu da vide i pridruže se" },
              { value: "restricted", label: "Ograničena", desc: "Svi vide, pridruživanje na odobrenje" },
              { value: "private", label: "Privatna", desc: "Samo pozvani mogu da vide" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  type === opt.value
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-white hover:border-accent/40"
                }`}
              >
                <div className={`text-[13px] font-medium mb-1 ${type === opt.value ? "text-accent" : "text-text-1"}`}>
                  {opt.label}
                </div>
                <div className="text-[11px] text-text-3 leading-snug">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[12px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Lokacija
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="npr. Vračar, Beograd (opciono)"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-1 outline-none focus:border-accent font-sans bg-white"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-[10px] border border-border text-[13px] text-text-2 bg-white cursor-pointer hover:bg-surface-2"
          >
            Otkaži
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!isValid || createMutation.isPending}
            className="px-6 py-2.5 rounded-[10px] bg-accent text-white text-[13px] font-medium border-none cursor-pointer disabled:opacity-50"
          >
            {createMutation.isPending ? "Kreiram..." : "Kreiraj zajednicu"}
          </button>
        </div>

        {createMutation.isError && (
          <div className="text-[13px] text-red-500 text-center">
            Greška. Pokušaj ponovo.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCommunityPage;
