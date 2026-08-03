import { useState } from "react";
import { Moon, Sparkles } from "lucide-react";
import AppRoutes from "./routes/AppRoutes";
import TabBar from "./components/TabBar";
import ToastProvider from "./components/ToastProvider";
import "./styles.css";

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <div
      className={
        dark
          ? "dark min-h-screen bg-neutral text-white"
          : "min-h-screen bg-bg text-neutral"
      }
    >
      <header className="sticky top-0 z-10 flex h-[72px] items-center gap-3 border-b border-neutral/10 bg-white/90 px-5 shadow-sm backdrop-blur dark:bg-neutral">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-white">
          CM
        </div>
        <div className="flex-1">
          <strong className="block tracking-[.18em] text-neutral dark:text-white">
            COPAMODA
          </strong>
          <span className="block text-[11px] text-neutral/50">
            Atelier manager
          </span>
        </div>
        <Sparkles size={18} className="text-primary" />
        <button
          aria-label="Cambiar tema"
          onClick={() => setDark(!dark)}
          className="rounded-full p-2 text-neutral/60 hover:bg-accent dark:text-white"
        >
          <Moon size={18} />
        </button>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-7 md:pb-10 md:pl-40">
        <AppRoutes />
      </main>
      <TabBar />
      <ToastProvider />
    </div>
  );
}
