"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const Ctx = createContext<(msg: React.ReactNode) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; msg: React.ReactNode } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((msg: React.ReactNode) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), msg });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex max-w-md items-start gap-2 rounded-lg bg-noche px-4 py-3 text-sm text-white shadow-lg">
            <span aria-hidden>✓</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
