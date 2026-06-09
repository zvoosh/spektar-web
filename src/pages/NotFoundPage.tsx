import { useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="font-serif text-[80px] leading-none text-accent mb-2 select-none">
        404
      </div>
      <h1 className="font-serif text-[22px] text-text-1 mb-2">
        Stranica nije pronađena
      </h1>
      <p className="text-[13px] text-text-3 mb-8 max-w-xs">
        Stranica koju tražiš ne postoji ili je premeštena na novu adresu.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-accent-hover transition-colors"
        >
          <Home size={14} strokeWidth={2.5} />
          Početna
        </button>
        <button
          onClick={() => navigate("/search")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-2 text-[13px] bg-surface cursor-pointer hover:bg-surface-2-2 transition-colors"
        >
          <Search size={14} strokeWidth={2} />
          Pretraži
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
