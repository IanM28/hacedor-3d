import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ProductGalleryProps {
  images: string[]
  alt: string
  code: string
}

export default function ProductGallery({ images, alt, code }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const current = images[selected]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--color-surface-2)]">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.img
              key={selected}
              src={current}
              alt={alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-sm text-[var(--color-text-muted)]">{code}</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-colors ${
                selected === idx
                  ? 'border-[var(--color-accent)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
