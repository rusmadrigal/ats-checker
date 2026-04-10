'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'ats_cookie_consent_v1';

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setAccepted(localStorage.getItem(STORAGE_KEY) === '1');
      } catch {
        setAccepted(false);
      }
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage bloqueado */
    }
    setAccepted(true);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!accepted ? (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="fixed bottom-3 z-[95] w-[min(100%-1.5rem,22.5rem)] pb-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] sm:bottom-5 sm:left-[max(1.25rem,env(safe-area-inset-left))] sm:w-[min(100%-2.5rem,24rem)]"
        >
          <div className="border-border/45 from-card/98 shadow-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-b to-card/90 shadow-2xl ring-1 ring-black/[0.04] backdrop-blur-2xl dark:ring-white/[0.06]">
            <div className="from-primary/[0.12] pointer-events-none absolute -top-12 -left-8 size-32 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
            <div className="relative p-4 sm:p-5">
              <div className="flex gap-3.5">
                <div className="bg-primary/14 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner">
                  <Cookie className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    id="cookie-banner-title"
                    className="text-foreground text-sm font-semibold tracking-tight"
                  >
                    Uso de cookies
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-[0.8125rem]">
                    Solo utilizamos lo necesario para que el sitio funcione. Consulta la política o acepta
                    para continuar.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-md shadow-primary/15 transition-[opacity,transform] hover:opacity-95 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Aceptar
                </button>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-primary inline-flex min-h-9 w-full items-center justify-center rounded-lg text-center text-xs font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Ver política de cookies
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
