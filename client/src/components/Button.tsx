import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-violet-500 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98]',
  ghost:
    'bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-white/15',
  danger:
    'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25',
  subtle: 'text-zinc-400 hover:text-white hover:bg-white/5',
} as const

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
