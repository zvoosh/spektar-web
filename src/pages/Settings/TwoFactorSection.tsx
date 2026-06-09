import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Shield, ShieldCheck, ShieldOff, CheckCircle } from "lucide-react";

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
          {isEnabled
            ? <ShieldCheck size={18} className="text-accent" strokeWidth={2} />
            : <Shield size={18} className="text-text-3" strokeWidth={2} />}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-text-1">Dvostepena verifikacija (2FA)</div>
          <div className="text-[12px] text-text-3">{isEnabled ? "Uključena — nalog je zaštićen" : "Isključena"}</div>
        </div>
        {isEnabled && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-accent-soft text-accent font-semibold border border-accent/20">
            Aktivna
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {success && (
          <div className="flex items-center gap-2.5 bg-accent-soft border border-accent/20 rounded-xl px-4 py-3 text-[13px] text-accent mb-4">
            <CheckCircle size={15} strokeWidth={2.5} />{success}
          </div>
        )}
        {error && (
          <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger mb-4">
            {error}
          </div>
        )}

        {step === "idle" && !isEnabled && (
          <div>
            <p className="text-[13px] text-text-3 leading-relaxed mb-4">
              Dvostepena verifikacija dodaje dodatni sloj zaštite pored lozinke.
            </p>
            <button
              onClick={() => { setSuccess(""); generateMutation.mutate(); }}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_8px_rgba(0,186,124,0.25)]"
            >
              <Shield size={14} strokeWidth={2.5} />
              {generateMutation.isPending ? "Generiše..." : "Uključi 2FA"}
            </button>
          </div>
        )}

        {step === "idle" && isEnabled && (
          <div>
            <p className="text-[13px] text-text-3 leading-relaxed mb-4">
              2FA je aktivan. Pri svakom prijavljivanju trebaće ti kod iz autentifikator aplikacije.
            </p>
            <button
              onClick={() => { setSuccess(""); setError(""); setStep("disable"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-danger/30 text-danger text-[13px] font-semibold bg-danger-soft hover:bg-danger hover:text-white cursor-pointer transition-colors"
            >
              <ShieldOff size={14} strokeWidth={2} /> Isključi 2FA
            </button>
          </div>
        )}

        {step === "setup" && qrData && (
          <div>
            <div className="flex items-start gap-5 mb-5">
              <div className="bg-white p-2.5 rounded-xl shrink-0">
                <img src={qrData.qrCodeDataUrl} alt="QR kod" className="w-36 h-36" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-text-2 leading-relaxed mb-3">
                  <strong className="text-text-1">1.</strong> Instaliraj <strong className="text-text-1">Google Authenticator</strong> ili <strong className="text-text-1">Authy</strong>.
                </p>
                <p className="text-[13px] text-text-2 leading-relaxed mb-3">
                  <strong className="text-text-1">2.</strong> Skeniraj QR ili unesi ručno:
                </p>
                <div className="bg-surface-2 rounded-lg px-3 py-2 font-mono text-[11px] text-text-3 break-all select-all">
                  {qrData.secret}
                </div>
              </div>
            </div>
            <p className="text-[13px] text-text-2 mb-3"><strong className="text-text-1">3.</strong> Unesi 6-cifreni kod:</p>
            <input
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              placeholder="000000"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && enableMutation.mutate(code)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[20px] text-text-1 text-center tracking-[0.3em] outline-none focus:border-accent bg-bg mb-4 font-mono transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={() => enableMutation.mutate(code)}
                disabled={code.length !== 6 || enableMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors"
              >
                {enableMutation.isPending ? "Verifikujem..." : "Potvrdi i uključi"}
              </button>
              <button
                onClick={() => { setStep("idle"); setQrData(null); setCode(""); setError(""); }}
                className="px-4 py-2.5 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {step === "disable" && (
          <div>
            <p className="text-[13px] text-text-3 leading-relaxed mb-4">
              Unesi kod iz autentifikator aplikacije da potvrdiš isključivanje.
            </p>
            <input
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              placeholder="000000"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && disableMutation.mutate(code)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[20px] text-text-1 text-center tracking-[0.3em] outline-none focus:border-accent bg-bg mb-4 font-mono transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={() => disableMutation.mutate(code)}
                disabled={code.length !== 6 || disableMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-danger hover:bg-danger/80 text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors"
              >
                {disableMutation.isPending ? "Isključujem..." : "Isključi 2FA"}
              </button>
              <button
                onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                className="px-4 py-2.5 rounded-xl border border-border text-[13px] text-text-2 bg-surface cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSection;
