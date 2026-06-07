import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { CheckCircle, XCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Token je nevažeći ili istekao");
    },
  });

  const handleSubmit = () => {
    setError("");
    if (!password || !confirm) { setError("Popuni sva polja"); return; }
    if (password.length < 6) { setError("Lozinka mora imati najmanje 6 karaktera"); return; }
    if (password !== confirm) { setError("Lozinke se ne poklapaju"); return; }
    mutation.mutate();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle size={48} className="text-danger mx-auto mb-3" />
          <div className="font-serif text-[20px] text-text-1 mb-2">Nevažeći link</div>
          <p className="text-[13px] text-text-3 mb-5">Link za reset je nevažeći ili je istekao.</p>
          <button onClick={() => navigate("/login")} className="text-accent text-[13px] font-semibold bg-transparent border-none cursor-pointer hover:underline">
            Nazad na prijavu
          </button>
        </div>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-accent" />
          </div>
          <div className="font-serif text-[22px] text-text-1 mb-2">Lozinka promenjena!</div>
          <p className="text-[13px] text-text-3 mb-6 leading-relaxed">
            Tvoja lozinka je uspešno resetovana. Možeš se sada prijaviti.
          </p>
          <button
            onClick={() => navigate("/login", { state: { background: { pathname: "/" } } })}
            className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
          >
            Prijavi se
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center mx-auto mb-3 shadow-[0_2px_12px_rgba(0,186,124,0.35)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="font-serif text-[26px] text-text-1">Spektar</div>
          <div className="text-[12px] text-text-3 mt-0.5">Beogradska zajednica</div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          <div className="text-[18px] font-semibold text-text-1 mb-1">Nova lozinka</div>
          <p className="text-[13px] text-text-3 mb-5 leading-relaxed">Unesi svoju novu lozinku.</p>

          {error && (
            <div className="bg-danger-soft border border-danger/20 rounded-xl px-3.5 py-2.5 text-[13px] text-danger mb-4">
              {error}
            </div>
          )}

          <div className="mb-3.5">
            <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
              Nova lozinka
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
              Potvrdi lozinku
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
          >
            {mutation.isPending ? "Menjam..." : "Postavi novu lozinku"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
