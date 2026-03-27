"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FireCanvas } from "@/components/landing/fire-canvas";

export function LandingExperience() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const mobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    [],
  );

  const onEnter = () => {
    setOpening(true);
    window.setTimeout(() => router.push("/login"), 1150);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--green)] text-white">
      <div
        className="absolute inset-0 animate-subtle-zoom bg-cover bg-center"
        style={{ backgroundImage: "url('/images/enish-interior.svg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,26,18,0.85)] to-transparent" />
      <FireCanvas />

      <section className="relative z-20 flex min-h-screen items-end justify-center px-6 pb-[12vh]">
        <div className="max-w-xl text-center">
          <p className="font-serif text-5xl tracking-[0.4em] text-[var(--gold)] md:text-6xl">
            ENISH
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.4em] text-[#f8f3e7]">
            Operations Hub
          </p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#f6edd5]">
            A private operations cockpit for service, compliance, inventory, and AI support at
            Enish Restaurant & Lounge Houston.
          </p>
          <div className="mt-10">
            <Button variant="outline" className="min-w-40" onClick={onEnter}>
              Enter
            </Button>
          </div>
          <div className="mt-5 text-xs uppercase tracking-[0.28em] text-[#f6edd5]/80">
            Private staff access only
          </div>
        </div>
      </section>

      <AnimatePresence>
        {opening ? (
          <motion.div className="pointer-events-none absolute inset-0 z-30" initial={false}>
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[var(--green)] md:block"
              initial={mobile ? { y: "100%" } : { x: "100%" }}
              animate={mobile ? { y: 0 } : { x: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="absolute right-0 top-0 h-full w-px bg-[var(--gold)]" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 origin-right bg-[var(--green)] md:block"
              initial={mobile ? { y: "-100%" } : { x: "-100%" }}
              animate={mobile ? { y: 0 } : { x: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="absolute left-0 top-0 h-full w-px bg-[var(--gold)]" />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[var(--green)]"
              initial={mobile ? { rotateX: 0, y: 0 } : { rotateY: 0, x: 0 }}
              animate={mobile ? { rotateX: -90, y: "-100%" } : { rotateY: -90, x: "-100%" }}
              transition={{ delay: 0.4, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1400 }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 origin-right bg-[var(--green)]"
              initial={mobile ? { rotateX: 0, y: 0 } : { rotateY: 0, x: 0 }}
              animate={mobile ? { rotateX: 90, y: "100%" } : { rotateY: 90, x: "100%" }}
              transition={{ delay: 0.4, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1400 }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Link href="/login" className="sr-only">
        Proceed to login
      </Link>
    </main>
  );
}
