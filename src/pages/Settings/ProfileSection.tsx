import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { Save, User, MapPin, CheckCircle } from "lucide-react";

const ProfileSection = () => {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: user?.username ?? "",
    displayName: user?.displayName ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => {
      toast.success("Profil je sačuvan");
      setSuccess(true);
      setError("");
      setAuth(updated, localStorage.getItem("token")!);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Greška pri čuvanju";
      toast.error(msg);
      setError(msg);
    },
  });

  const isDirty =
    form.username !== (user?.username ?? "") ||
    form.displayName !== (user?.displayName ?? "") ||
    form.location !== (user?.location ?? "") ||
    form.bio !== (user?.bio ?? "");

  const [validationError, setValidationError] = useState("");

  const validate = () => {
    const u = form.username.trim();
    if (u.length < 3) return "Korisničko ime mora imati najmanje 3 karaktera.";
    if (u.length > 30) return "Korisničko ime ne može biti duže od 30 karaktera.";
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Korisničko ime može sadržati samo slova, brojeve i _";
    return "";
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center">
          <User size={18} className="text-text-3" strokeWidth={2} />
        </div>
        <div className="font-semibold text-[14px] text-text-1">Profil</div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {success && (
          <div className="flex items-center gap-2.5 bg-accent-soft border border-accent/20 rounded-xl px-4 py-3 text-[13px] text-accent">
            <CheckCircle size={15} strokeWidth={2.5} /> Sačuvano
          </div>
        )}
        {error && <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger">{error}</div>}

        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Korisničko ime
          </label>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="marko_bg"
            maxLength={30}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
          />
          <p className="text-[11px] text-text-3 mt-1">Vidljivo svima. Jedinstven identifikator na platformi.</p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Prikazano ime
          </label>
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="Marko Marković"
            maxLength={50}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
          />
          <p className="text-[11px] text-text-3 mt-1">Opciono puno ime prikazano na profilu.</p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin size={11} /> Lokacija
          </label>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Vračar, Beograd"
            maxLength={100}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Nešto o sebi..."
            maxLength={300}
            rows={3}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors resize-none"
          />
          <p className="text-[11px] text-text-3 mt-1 text-right">{form.bio.length}/300</p>
        </div>

        {validationError && (
          <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger">{validationError}</div>
        )}

        <button
          onClick={() => {
            const err = validate();
            if (err) { setValidationError(err); return; }
            setValidationError("");
            mutation.mutate({
              username: form.username.trim() || undefined,
              displayName: form.displayName.trim() || undefined,
              location: form.location.trim() || undefined,
              bio: form.bio.trim() || undefined,
            });
          }}
          disabled={!isDirty || mutation.isPending}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors shadow-[0_2px_8px_rgba(0,186,124,0.25)]"
        >
          <Save size={14} strokeWidth={2.5} />
          {mutation.isPending ? "Čuvam..." : "Sačuvaj promene"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
