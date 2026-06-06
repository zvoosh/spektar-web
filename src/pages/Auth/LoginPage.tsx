import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries();
      navigate(from, { replace: true });
    },
    onError: () => {
      setError("Pogrešan email ili lozinka");
    },
  });

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Popuni sva polja");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-100">
        <div className="text-center mb-8">
          <div className="w-13 h-13 rounded-[14px] bg-accent flex items-center justify-center text-2xl mx-auto mb-3">
            🗺
          </div>
          <div className="font-serif text-[28px] text-text-1">Spektar</div>
          <div className="text-[13px] text-text-3 mt-1">
            Beogradska zajednica
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[16px] p-7">
          <div className="text-lg font-medium text-text-1 mb-5">
            Prijavi se
          </div>

          {error && (
            <div className="bg-danger-soft border border-[#FECACA] rounded-md py-2.5 px-3.5 text-[13px] text-danger mb-4">
              {error}
            </div>
          )}

          <div className="mb-3.5">
            <label className="block text-xs font-medium text-text-2 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="marko@primer.com"
              className="w-full py-2.5 px-3.5 rounded-md border border-border text-sm text-text-1 outline-none focus:border-accent"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-text-2 mb-1.5">
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
              className="w-full py-2.5 px-3.5 rounded-md border border-border text-sm text-text-1 outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full py-2.75 rounded-md bg-accent text-white text-sm font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Prijavljujem..." : "Prijavi se"}
          </button>

          <div className="text-center mt-4 text-[13px] text-text-3">
            Nemaš nalog?{" "}
            <Link to="/register" className="text-accent font-medium no-underline">
              Registruj se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
