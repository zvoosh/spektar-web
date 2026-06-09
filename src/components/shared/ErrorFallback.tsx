import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  error: unknown;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-5 border border-red-200 dark:border-red-900">
        <AlertTriangle size={24} className="text-red-500" strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-[20px] text-text-1 mb-2">
        Nešto je pošlo po zlu
      </h2>
      <p className="text-[13px] text-text-3 mb-1 max-w-xs">
        Desila se neočekivana greška. Pokušaj ponovo ili se vrati na početnu stranicu.
      </p>

      {import.meta.env.DEV && error instanceof Error && (
        <details className="mt-3 mb-5 text-left max-w-md w-full">
          <summary className="text-[11px] text-text-3 cursor-pointer select-none hover:text-text-2 transition-colors">
            Detalji greške (dev only)
          </summary>
          <pre className="mt-2 p-3 rounded-xl bg-surface-2 text-[11px] text-red-500 overflow-auto whitespace-pre-wrap border border-border">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-accent-hover transition-colors"
        >
          <RefreshCw size={14} strokeWidth={2.5} />
          Pokušaj ponovo
        </button>
        <button
          onClick={() => { navigate("/"); resetErrorBoundary(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-2 text-[13px] bg-surface cursor-pointer hover:bg-surface-2-2 transition-colors"
        >
          <Home size={14} strokeWidth={2} />
          Početna
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
