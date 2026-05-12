import { format, parseISO } from 'date-fns'
import type { Candidate } from '../api/types'
import { Button } from './Button'

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  const a = p[0]?.[0] ?? ''
  const b = p.length > 1 ? p[p.length - 1]![0]! : p[0]?.[1] ?? ''
  return (a + b).toUpperCase()
}

type Props = {
  candidate: Candidate
  onEdit: (c: Candidate) => void
  onDelete: (c: Candidate) => void
}

export function CandidateCard({ candidate, onEdit, onDelete }: Props) {
  const dob = (() => {
    try {
      return format(parseISO(candidate.dateOfBirth), 'MMM d, yyyy')
    } catch {
      return candidate.dateOfBirth
    }
  })()

  return (
    <article
      className="card-shine group relative flex flex-col rounded-2xl glass p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-cyan-500/25"
      style={{ animationDelay: `${Math.min(candidate.id * 40, 400)}ms` }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-sm font-bold tracking-tight text-white ring-1 ring-white/10"
            aria-hidden
          >
            {initials(candidate.fullName)}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-white">{candidate.fullName}</h3>
            <p className="text-sm text-zinc-500">{candidate.email}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
          <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => onEdit(candidate)}>
            Edit
          </Button>
          <Button variant="danger" className="!px-2.5 !py-1.5 text-xs" onClick={() => onDelete(candidate)}>
            Delete
          </Button>
        </div>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500">Born</dt>
          <dd className="font-medium text-zinc-200">{dob}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Phone</dt>
          <dd className="font-medium text-zinc-200">{candidate.contactNumber}</dd>
        </div>
      </dl>

      <div className="mt-auto border-t border-white/5 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Skills</p>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.length === 0 ? (
            <span className="text-sm text-zinc-600">No skills linked yet</span>
          ) : (
            candidate.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-200 ring-1 ring-cyan-500/20"
              >
                {s.name}
              </span>
            ))
          )}
        </div>
      </div>
    </article>
  )
}
