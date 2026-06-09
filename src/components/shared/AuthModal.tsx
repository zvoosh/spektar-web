import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { X, ArrowLeft, Mail } from "lucide-react";

// ─── Login form ───────────────────────────────────────────────────────────────

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [twoFactorPending, setTwoFactorPending] = useState<{
    tempToken: string;
  } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [view, setView] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [forgotEmail, setForgotEmail] = useState("");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const mutation = useMutation({
    mutationFn: (creds: { email: string; password: string }) => {
      const deviceToken =
        localStorage.getItem("spektar_device_token") ?? undefined;
      return authApi.login({ ...creds, deviceToken });
    },
    onSuccess: (data) => {
      if ("requiresTwoFactor" in data && data.requiresTwoFactor) {
        setTwoFactorPending({ tempToken: data.tempToken });
        return;
      }
      if ("token" in data) {
        setAuth(data.user, data.token, "refreshToken" in data ? data.refreshToken : undefined);
        queryClient.invalidateQueries();
        navigate(from, { replace: true });
      }
    },
    onError: () => setError("Pogrešan email ili lozinka"),
  });

  const twoFactorMutation = useMutation({
    mutationFn: ({ tempToken, code }: { tempToken: string; code: string }) =>
      authApi.verifyTwoFactor(tempToken, code, rememberDevice),
    onSuccess: (data) => {
      if (data.deviceToken) {
        localStorage.setItem("spektar_device_token", data.deviceToken);
      }
      setAuth(data.user, data.token, (data as any).refreshToken);
      queryClient.invalidateQueries();
      navigate(from, { replace: true });
    },
    onError: () => setError("Pogrešan autentifikator kod"),
  });

  const forgotMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => setView("forgot-sent"),
    onError: () => setView("forgot-sent"), // uvek isti odgovor
  });

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Popuni sva polja");
      return;
    }
    mutation.mutate(form);
  };

  // ── 2FA step ──
  if (twoFactorPending) {
    return (
      <>
        <button
          onClick={() => {
            setTwoFactorPending(null);
            setTwoFactorCode("");
            setError("");
          }}
          className="flex items-center gap-1.5 text-[12px] text-text-3 bg-transparent border-none cursor-pointer mb-4 hover:text-text-1 transition-colors"
        >
          <ArrowLeft size={13} /> Nazad
        </button>
        <div className="text-[18px] font-semibold text-text-1 mb-1">
          Dvostepena verifikacija
        </div>
        <p className="text-[13px] text-text-3 mb-5 leading-relaxed">
          Unesi 6-cifreni kod iz autentifikator aplikacije.
        </p>

        {error && (
          <div className="bg-danger-soft border border-danger/20 rounded-xl px-3.5 py-2.5 text-[13px] text-danger mb-4">
            {error}
          </div>
        )}

        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Autentifikator kod
        </label>
        <input
          autoFocus
          value={twoFactorCode}
          onChange={(e) =>
            setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          maxLength={6}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            twoFactorCode.length === 6 &&
            twoFactorMutation.mutate({
              tempToken: twoFactorPending.tempToken,
              code: twoFactorCode,
            })
          }
          className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[20px] text-text-1 text-center tracking-[0.3em] outline-none focus:border-accent bg-bg mb-4 transition-colors font-mono"
        />

        {/* Zapamti uređaj */}
        <label className="flex items-center gap-2.5 mb-5 cursor-pointer group">
          <div
            onClick={() => setRememberDevice((v) => !v)}
            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
              rememberDevice ? "bg-accent border-accent" : "border-border bg-bg"
            }`}
          >
            {rememberDevice && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path
                  d="M1 3.5L3.5 6L8 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-[12.5px] text-text-3 group-hover:text-text-2 transition-colors select-none">
            Zapamti ovaj uređaj 30 dana
          </span>
        </label>

        <button
          onClick={() =>
            twoFactorMutation.mutate({
              tempToken: twoFactorPending.tempToken,
              code: twoFactorCode,
            })
          }
          disabled={twoFactorCode.length !== 6 || twoFactorMutation.isPending}
          className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
        >
          {twoFactorMutation.isPending ? "Verifikujem..." : "Potvrdi"}
        </button>
      </>
    );
  }

  // ── Forgot password sent ──
  if (view === "forgot-sent") {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-accent" />
        </div>
        <div className="text-[17px] font-semibold text-text-1 mb-2">
          Proveri email
        </div>
        <p className="text-[13px] text-text-3 leading-relaxed mb-6">
          Ako nalog sa adresom{" "}
          <strong className="text-text-2">{forgotEmail}</strong> postoji,
          poslali smo ti link za reset lozinke.
        </p>
        <button
          onClick={() => {
            setView("login");
            setForgotEmail("");
          }}
          className="text-[13px] text-accent bg-transparent border-none cursor-pointer font-semibold hover:underline"
        >
          Nazad na prijavu
        </button>
      </div>
    );
  }

  // ── Forgot password form ──
  if (view === "forgot") {
    return (
      <>
        <button
          onClick={() => setView("login")}
          className="flex items-center gap-1.5 text-[12px] text-text-3 bg-transparent border-none cursor-pointer mb-4 hover:text-text-1 transition-colors"
        >
          <ArrowLeft size={13} /> Nazad
        </button>
        <div className="text-[18px] font-semibold text-text-1 mb-1">
          Zaboravljena lozinka
        </div>
        <p className="text-[13px] text-text-3 mb-5 leading-relaxed">
          Unesi email i poslaćemo ti link za reset lozinke.
        </p>

        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          type="email"
          autoFocus
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          placeholder="marko@primer.com"
          onKeyDown={(e) =>
            e.key === "Enter" &&
            forgotEmail &&
            forgotMutation.mutate(forgotEmail)
          }
          className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg mb-5 transition-colors"
        />
        <button
          onClick={() => forgotEmail && forgotMutation.mutate(forgotEmail)}
          disabled={!forgotEmail || forgotMutation.isPending}
          className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
        >
          {forgotMutation.isPending ? "Šaljem..." : "Pošalji link"}
        </button>
      </>
    );
  }

  // ── Login form ──
  return (
    <>
      <div className="text-[18px] font-semibold text-text-1 mb-5">
        Prijavi se
      </div>

      {error && (
        <div className="bg-danger-soft border border-danger/20 rounded-xl px-3.5 py-2.5 text-[13px] text-danger mb-4">
          {error}
        </div>
      )}

      <div className="mb-3.5">
        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          type="email"
          autoFocus
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="marko@primer.com"
          className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
        />
      </div>

      <div className="mb-1.5">
        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Lozinka
        </label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full py-2.5 px-3.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
        />
      </div>

      <div className="flex justify-end mb-5">
        <button
          onClick={() => setView("forgot")}
          className="text-[12px] text-text-3 bg-transparent border-none cursor-pointer hover:text-accent transition-colors"
        >
          Zaboravio si lozinku?
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
      >
        {mutation.isPending ? "Prijavljujem..." : "Prijavi se"}
      </button>

      <div className="text-center mt-4 text-[13px] text-text-3">
        Nemaš nalog?{" "}
        <Link
          to="/register"
          state={location.state}
          className="text-accent font-semibold no-underline hover:underline"
        >
          Registruj se
        </Link>
      </div>
    </>
  );
};

// ─── Register form ────────────────────────────────────────────────────────────

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
      navigate("/", { replace: true });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Greška pri registraciji");
    },
  });

  const handleSubmit = () => {
    setError("");
    const u = form.username.trim();
    const e = form.email.trim();
    if (!u || !e || !form.password) {
      setError("Popuni sva polja");
      return;
    }
    if (u.length < 3 || u.length > 30) {
      setError("Korisničko ime mora imati između 3 i 30 karaktera");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      setError("Korisničko ime može sadržati samo slova, brojeve i _");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setError("Unesi ispravnu email adresu");
      return;
    }
    if (form.password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera");
      return;
    }
    mutation.mutate({ username: u, email: e, password: form.password });
  };

  return (
    <>
      <div className="text-[18px] font-semibold text-text-1 mb-5">
        Kreiraj nalog
      </div>

      {error && (
        <div className="bg-danger-soft border border-danger/20 rounded-xl px-3.5 py-2.5 text-[13px] text-danger mb-4">
          {error}
        </div>
      )}

      <div className="mb-3.5">
        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Korisničko ime
        </label>
        <input
          autoFocus
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="marko_bg"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
        />
      </div>

      <div className="mb-3.5">
        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="marko@primer.com"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
        />
      </div>

      <div className="mb-5">
        <label className="block text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1.5">
          Lozinka
        </label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-[13px] text-text-1 outline-none focus:border-accent bg-bg transition-colors"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60 transition-colors shadow-[0_2px_10px_rgba(0,186,124,0.3)]"
      >
        {mutation.isPending ? "Registrujem..." : "Registruj se"}
      </button>

      <div className="text-center mt-4 text-[13px] text-text-3">
        Već imaš nalog?{" "}
        <Link
          to="/login"
          state={location.state}
          className="text-accent font-semibold no-underline hover:underline"
        >
          Prijavi se
        </Link>
      </div>
    </>
  );
};

// ─── Modal wrapper ────────────────────────────────────────────────────────────

interface AuthModalProps {
  mode: "login" | "register";
}

const AuthModal = ({ mode }: AuthModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const state = location.state as {
      from?: { pathname: string };
      background?: { pathname: string };
    } | null;
    const back = state?.background?.pathname ?? state?.from?.pathname;
    const target =
      back && back !== "/login" && back !== "/register" ? back : "/";
    navigate(target, { replace: true });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <img loading="lazy" src="/spektarLogo.png" className="w-8 h-8 object-contain" />
            <span className="font-serif font-bold text-[15px] text-text-1 tracking-tight">
              Spektar
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border hover:text-text-1 transition-colors"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AuthModal;
