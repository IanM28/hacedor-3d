import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const transition = (delay: number) => ({
  duration: 0.65,
  delay,
  ease: 'easeOut' as const,
})

const hidden = { opacity: 0, y: 24 }

export default function HeroSection() {
  return (
    <section className="px-6 pb-6 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto w-full max-w-7xl">
        <motion.p
          className="font-mono text-xs tracking-widest text-[var(--color-accent)]"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0)}
        >
          HACEDOR 3D — LIBERTADOR SAN MARTÍN
        </motion.p>

        <motion.h1
          className="mt-4 max-w-3xl font-display text-5xl leading-none tracking-wide text-[var(--color-text-primary)] sm:text-7xl"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.1)}
        >
          DISEÑO QUE TIENE PROPÓSITO
        </motion.h1>

        <motion.p
          className="mt-5 max-w-xl font-body text-base text-[var(--color-text-secondary)] sm:text-lg"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.2)}
        >
          Objetos de diseño tecnológico. Hechos en Libertador San Martín, Entre Ríos. Envíos a todo el país.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.3)}
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-7 py-3 font-body font-medium text-[var(--color-on-accent)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Ver colección
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
