import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore, type Theme } from "@/store/themeStore";
import { Shield, ShieldCheck, ShieldOff, CheckCircle, Save, User, MapPin, Bell, Sun, Moon, Monitor } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_NOTIF_PREFS = { comments: true, upvotes: true, friends: true, messages: true };

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-10 h-5.5 rounded-full border-none cursor-pointer transition-colors shrink-0 ${value ? "bg-accent" : "bg-surface-2"}`}
    style={{ height: "22px", width: "40px" }}
  >
    <span
      className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all"
      style={{ left: value ? "20px" : "3px" }}
    />
  </button>
);

// ─── 2FA Section ──────────────────────────────────────────────────────────────

const TwoFactorSection = () => {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"idle" | "setup" | "disable">("idle");
  const [qrData, setQrData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateMutation = useMutation({
    mutationFn: authApi.generate2FA,
    onSuccess: (data) => { setQrData(data); setStep("setup"); setError(""); },
  });

  const enableMutation = useMutation({
    mutationFn: (c: string) => authApi.enable2FA(c),
    onSuccess: () => {
      setSuccess("2FA je uspešno uključen!");
      setStep("idle"); setQrData(null); setCode("");
      if (user) setAuth({ ...user, isTwoFactorEnabled: true }, localStorage.getItem("token")!);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: () => setError("Pogrešan kod. Proveri vreme na uređaju."),
  });

  const disableMutation = useMutation({
    mutationFn: (c: string) => authApi.disable2FA(c),
    onSuccess: () => {
      setSuccess("2FA je isključen.");
      setStep("idle"); setCode("");
      if (user) setAuth({ ...user, isTwoFactorEnabled: false }, localStorage.getItem("token")!);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: () => setError("Pogrešan kod."),
  });

  const isEnabled = user?.isTwoFactorEnabled;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEnabled ? "bg-accent-soft" : "bg-surface-2"}`}>
          {isEnabled ? <ShieldCheck size={18} className="text-accent" strokeWidth={2} /> : <Shield size={18} className="text-text-3" strokeWidth={2} />}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-text-1">Dvostepena verifikacija (2FA)</div>
          <div className="text-[12px] text-text-3">{isEnabled ? "Uključena — nalog je zaštićen" : "Isključena"}</div>
        </div>
        {isEnabled && <span className="text-[11px] px-2.5 py-1 rounded-full bg-accent-soft text-accent font-semibold border border-accent/20">Aktivna</span>}
      </div>

      <div className="px-5 py-4">
        {success && (
          <div className="flex items-center gap-2.5 bg-accent-soft border border-accent/20 rounded-xl px-4 py-3 text-[13px] text-accent mb-4">
            <CheckCircle size={15} strokeWidth={2.5} />{success}
          </div>
        )}
        {error && <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger mb-4">{error}</div>}

        {step === "idle" && (
          !isEnabled ? (
            <div>
              <p className="text-[13px] text-text-3 leading-relaxed mb-4">Dvostepena verifikacija dodaje dodatni sloj zaštite pored lozinke.</p>
              <button onClick={() => { setSuccess(""); generateMutation.mutate(); }} disabled={generateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_8px_rgba(0,186,124,0.25)]">
                <Shield size={14} strokeWidth={2.5} />
                {generateMutation.isPending ? "Generiše..." : "Uključi 2FA"}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-text-3 leading-relaxed mb-4">2FA je aktivan. Pri svakom prijavljivanju trebaće ti kod iz autentifikator aplikacije.</p>
              <button onClick={() => { setSuccess(""); setError(""); setStep("disable"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-danger/30 text-danger text-[13px] font-semibold bg-danger-soft hover:bg-danger hover:text-white cursor-pointer transition-colors">
                <ShieldOff size={14} strokeWidth={2} />Isključi 2FA
              </button>
            </div>
          )
        )}

        {step === "setup" && qrData && (
          <div>
            <div className="flex items-start gap-5 mb-5">
              <div className="bg-white p-2.5 rounded-xl shrink-0"><img src={qrData.qrCodeDataUrl} alt="QR kod" className="w-36 h-36" /></div>
              <div className="flex-1">
                <p className="text-[13px] text-text-2 leading-relaxed mb-3"><strong className="text-text-1">1.</strong> Instaliraj <strong className="text-text-1">Google Authenticator</strong> ili <strong className="text-text-1">Authy</strong>.</p>
                <p className="text-[13px] text-text-2 leading-relaxed mb-3"><strong className="text-text-1">2.</strong> Skeniraj QR ili unesi ručno:</p>
                <div className="bg-surface-2 rounded-lg px-3 py-2 font-mono text-[11px] text-text-3 break-all select-all">{qrData.secret}</div>
              </div>
            </div>
            <p className="text-[13px] text-text-2 mb-3"><strong className="text-text-1">3.</strong> Unesi 6-cifreni kod:</p>
            <input autoFocus value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              placeholder="000000" maxLength={6} onKeyDown={(e) => e.key === "Enter" && code.length === 6 && enableMutation.mutate(code)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[20px] text-text-1 text-center tracking-[0.3em] outline-none focus:border-accent bg-bg mb-4 font-mono transition-colors" />
            <div className="flex gap-2">
              <button onClick={() => enableMutation.mutate(code)} disabled={code.length !== 6 || enableMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors">
                {enableMutation.isPending ? "Verifikujem..." : "Potvrdi i uključi"}
              </button>
              <button onClick={() => { setStep("idle"); setQrData(null); setCode(""); setError(""); }}
                className="px-4 py-2.5 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2 transition-colors">Otkaži</button>
            </div>
          </div>
        )}

        {step === "disable" && (
          <div>
            <p className="text-[13px] text-text-3 leading-relaxed mb-4">Unesi kod iz autentifikator aplikacije da potvrdiš isključivanje.</p>
            <input autoFocus value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              placeholder="000000" maxLength={6} onKeyDown={(e) => e.key === "Enter" && code.length === 6 && disableMutation.mutate(code)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[20px] text-text-1 text-center tracking-[0.3em] outline-none focus:border-accent bg-bg mb-4 font-mono transition-colors" />
            <div className="flex gap-2">
              <button onClick={() => disableMutation.mutate(code)} disabled={code.length !== 6 || disableMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-danger hover:bg-danger/80 text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors">
                {disableMutation.isPending ? "Isključujem..." : "Isključi 2FA"}
              </button>
              <button onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                className="px-4 py-2.5 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2 transition-colors">Otkaži</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Profile Section ──────────────────────────────────────────────────────────

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
      setSuccess(true);
      setError("");
      setAuth(updated, localStorage.getItem("token")!);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Greška pri čuvanju");
    },
  });

  const isDirty =
    form.username !== (user?.username ?? "") ||
    form.displayName !== (user?.displayName ?? "") ||
    form.location !== (user?.location ?? "") ||
    form.bio !== (user?.bio ?? "");

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

        {/* Korisničko ime */}
        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Korisničko ime
          </label>
          <input value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="marko_bg" maxLength={30}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors" />
          <p className="text-[11px] text-text-3 mt-1">Vidljivo svima. Jedinstven identifikator na platformi.</p>
        </div>

        {/* Prikazano ime */}
        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
            Prikazano ime
          </label>
          <input value={form.displayName} onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))}
            placeholder="Marko Marković" maxLength={50}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors" />
          <p className="text-[11px] text-text-3 mt-1">Opciono puno ime prikazano na profilu.</p>
        </div>

        {/* Lokacija */}
        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin size={11} /> Lokacija
          </label>
          <input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Vračar, Beograd" maxLength={100}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors" />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Nešto o sebi..." maxLength={300} rows={3}
            className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors resize-none" />
          <p className="text-[11px] text-text-3 mt-1 text-right">{form.bio.length}/300</p>
        </div>

        <button
          onClick={() => mutation.mutate({ username: form.username || undefined, displayName: form.displayName || undefined, location: form.location || undefined, bio: form.bio || undefined })}
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

// ─── Notifications Section ────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { key: "comments" as const, label: "Komentari na mom postu", desc: "Kada neko komentariše tvoj post" },
  { key: "upvotes" as const, label: "Upvote", desc: "Kada neko upvotuje tvoj post" },
  { key: "friends" as const, label: "Novi prijatelji", desc: "Kada neko pošalje zahtev za prijateljstvo" },
  { key: "messages" as const, label: "Direktne poruke", desc: "Kada primiš novu poruku" },
];

const NotificationsSection = () => {
  const { user, setAuth } = useAuthStore();
  const prefs = { ...DEFAULT_NOTIF_PREFS, ...(user?.notificationPrefs ?? {}) };
  const [local, setLocal] = useState(prefs);

  // Sync kad se user promeni
  useEffect(() => {
    setLocal({ ...DEFAULT_NOTIF_PREFS, ...(user?.notificationPrefs ?? {}) });
  }, [user?.notificationPrefs]);

  const mutation = useMutation({
    mutationFn: (notificationPrefs: typeof prefs) => usersApi.updateMe({ notificationPrefs }),
    onSuccess: (updated) => {
      setAuth(updated, localStorage.getItem("token")!);
    },
  });

  const handleToggle = (key: keyof typeof prefs, value: boolean) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    mutation.mutate(next);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center">
          <Bell size={18} className="text-text-3" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-[14px] text-text-1">Obaveštenja</div>
          <div className="text-[12px] text-text-3">Bira za šta primaš notifikacije</div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {NOTIF_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-3.5 gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1">{item.label}</div>
              <div className="text-[11.5px] text-text-3 mt-0.5">{item.desc}</div>
            </div>
            <Toggle value={local[item.key]} onChange={(v) => handleToggle(item.key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Theme Section ────────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; label: string; desc: string; Icon: React.ElementType }[] = [
  { value: "dark",   label: "Tamna",    desc: "Uvek tamna tema",         Icon: Moon    },
  { value: "light",  label: "Svetla",   desc: "Uvek svetla tema",        Icon: Sun     },
  { value: "system", label: "Sistem",   desc: "Prati podešavanja uređaja", Icon: Monitor },
];

const ThemeSection = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center">
          <Sun size={18} className="text-text-3" strokeWidth={2} />
        </div>
        <div>
          <div className="font-semibold text-[14px] text-text-1">Izgled</div>
          <div className="text-[12px] text-text-3">Odaberi temu aplikacije</div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ value, label, desc, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface-2 hover:border-border-strong"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? "bg-accent text-white" : "bg-surface text-text-3"}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <div className={`text-[13px] font-semibold ${active ? "text-accent" : "text-text-1"}`}>{label}</div>
                <div className="text-[10.5px] text-text-3 mt-0.5 leading-tight">{desc}</div>
              </div>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────

const SettingsPage = () => (
  <div className="max-w-2xl mx-auto">
    <div className="font-serif text-[24px] text-text-1 mb-1">Podešavanja</div>
    <p className="text-[13px] text-text-3 mb-6">Upravljaj nalogom i podešavanjima</p>

    <div className="flex flex-col gap-6">
      {/* Profil */}
      <div>
        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.12em] mb-3 px-1">Profil</div>
        <ProfileSection />
      </div>

      {/* Obaveštenja */}
      <div>
        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.12em] mb-3 px-1">Obaveštenja</div>
        <NotificationsSection />
      </div>

      {/* Izgled */}
      <div>
        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.12em] mb-3 px-1">Izgled</div>
        <ThemeSection />
      </div>

      {/* Bezbednost */}
      <div>
        <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.12em] mb-3 px-1">Bezbednost</div>
        <TwoFactorSection />
      </div>
    </div>
  </div>
);

export default SettingsPage;
