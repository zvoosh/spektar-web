import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate("/");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Greška pri registraciji");
    },
  });

  const handleSubmit = () => {
    setError("");
    if (!form.username || !form.email || !form.password) {
      setError("Popuni sva polja");
      return;
    }
    if (form.password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-13 h-13 rounded-[14px] bg-accent flex items-center justify-center text-2xl mx-auto mb-3">
            🗺
          </div>
          <div className="font-serif text-[28px] text-text-1">
            Spektar
          </div>
          <div className="text-[13px] text-text-3 mt-1">
            Beogradska zajednica
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-7">
          <div className="text-[18px] font-medium text-text-1 mb-5">
            Kreiraj nalog
          </div>

          {error && (
            <div className="bg-danger-soft border border-[#FECACA] rounded-lg px-3.5 py-2.5 text-[13px] text-danger mb-4">
              {error}
            </div>
          )}

          <div className="mb-3.5">
            <label className="text-xs font-medium text-text-2 block mb-1.5">
              Korisničko ime
            </label>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="marko_bg"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-text-1 outline-none font-sans focus:border-accent"
            />
          </div>

          <div className="mb-3.5">
            <label className="text-xs font-medium text-text-2 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="marko@primer.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-text-1 outline-none font-sans focus:border-accent"
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-text-2 block mb-1.5">
              Lozinka
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-text-1 outline-none font-sans focus:border-accent"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full p-2.75 rounded-lg bg-accent text-white border-0 text-sm font-medium cursor-pointer font-sans disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mutation.isPending ? "Registrujem..." : "Registruj se"}
          </button>

          <div className="text-center mt-4 text-[13px] text-text-3">
            Već imaš nalog?{" "}
            <Link
              to="/login"
              className="text-accent font-medium no-underline"
            >
              Prijavi se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
