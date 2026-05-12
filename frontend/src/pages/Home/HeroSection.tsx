import { motion } from 'framer-motion'

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const transition = (delay: number) => ({
  duration: 0.65,
  delay,
  ease: 'easeOut' as const,
})

const hidden = { opacity: 0, y: 24 }

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_BG }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-4xl text-center">
        <motion.p
          className="font-mono text-xs tracking-widest text-[var(--color-accent)]"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0)}
        >
          HACEDOR 3D — BARILOCHE
        </motion.p>

        <motion.h1
          className="mt-5 font-display text-6xl leading-none tracking-wide text-[var(--color-text-primary)] sm:text-7xl lg:text-8xl"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.1)}
        >
          DISEÑO QUE TIENE PROPÓSITO
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-lg font-body text-base text-[var(--color-text-secondary)] sm:text-lg"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.2)}
        >
          Objetos de diseño tecnológico. Fabricados en Bariloche.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.3)}
        >
          <a
            href="/catalogo"
            className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-7 py-3 font-body font-medium text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Ver colección
          </a>
        </motion.div>
      </div>
    </section>
  )
}
