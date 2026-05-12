import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { hrApi } from './api/hrApi'
import type { Candidate } from './api/types'
import { Button } from './components/Button'
import { CandidateCard } from './components/CandidateCard'
import { CandidateModal } from './components/CandidateModal'
import { SkillCatalog } from './components/SkillCatalog'

function useToast() {
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null)

  const notify = (text: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ text, kind })
    window.setTimeout(() => setToast(null), 4200)
  }

  return { toast, notify }
}

export default function App() {
  const qc = useQueryClient()
  const { toast, notify } = useToast()

  const [draftName, setDraftName] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<number>>(new Set())
  const [appliedName, setAppliedName] = useState('')
  const [appliedSkillNames, setAppliedSkillNames] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<Candidate | null>(null)

  const skillsQuery = useQuery({
    queryKey: ['skills'],
    queryFn: () => hrApi.skills.list(),
  })

  const candidatesQuery = useQuery({
    queryKey: ['candidates', appliedName, appliedSkillNames.join('\u0001')],
    queryFn: () =>
      hrApi.candidates.search(
        appliedName.trim() || undefined,
        appliedSkillNames.length > 0 ? appliedSkillNames : undefined,
      ),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => hrApi.candidates.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      notify('Candidate removed')
    },
    onError: (e: Error) => notify(e.message, 'err'),
  })

  const skills = skillsQuery.data ?? []

  const toggleSkill = (id: number) => {
    setSelectedSkillIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const applySearch = () => {
    setAppliedName(draftName)
    const names = skills.filter((s) => selectedSkillIds.has(s.id)).map((s) => s.name)
    setAppliedSkillNames(names)
  }

  const clearSearch = () => {
    setDraftName('')
    setSelectedSkillIds(new Set())
    setAppliedName('')
    setAppliedSkillNames([])
  }

  const openCreate = () => {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (c: Candidate) => {
    setModalMode('edit')
    setEditing(c)
    setModalOpen(true)
  }

  const confirmDelete = (c: Candidate) => {
    if (window.confirm(`Remove ${c.fullName} from the platform?`)) {
      deleteMut.mutate(c.id)
    }
  }

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (appliedName.trim()) n++
    n += appliedSkillNames.length
    return n
  }, [appliedName, appliedSkillNames])

  const list = candidatesQuery.data ?? []

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="glow-orb left-[-10%] top-[-20%] h-[420px] w-[420px] bg-cyan-500" />
      <div className="glow-orb right-[-15%] top-[10%] h-[380px] w-[380px] bg-violet-600" />

      <header className="relative border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/90">Intens internship</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Talent console</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Search, hire, and curate skills — wired to your .NET 8 API.
            </p>
          </div>
          <Button className="self-start shadow-xl shadow-cyan-500/10 sm:self-auto" onClick={openCreate}>
            + New candidate
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10">
        <section className="mb-10 rounded-3xl glass p-6 ring-1 ring-cyan-500/15">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">Discover</h2>
              <p className="text-sm text-zinc-500">
                Name substring + skills (must match <span className="text-zinc-300">all</span> selected skills).
              </p>
            </div>
            {activeFilterCount > 0 && (
              <span className="text-xs font-medium text-cyan-400/90">{activeFilterCount} active filter(s)</span>
            )}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            <label className="block flex-1">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Name contains</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                placeholder="e.g. Petrović"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </label>
            <div className="flex-1">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Skills (AND)</span>
              <div className="flex min-h-[48px] flex-wrap gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
                {skillsQuery.isLoading ? (
                  <span className="text-sm text-zinc-500">Loading…</span>
                ) : skills.length === 0 ? (
                  <span className="text-sm text-zinc-500">No skills in catalog.</span>
                ) : (
                  skills.map((s) => {
                    const on = selectedSkillIds.has(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          on
                            ? 'bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-white ring-1 ring-cyan-400/40'
                            : 'bg-white/5 text-zinc-400 ring-1 ring-transparent hover:bg-white/10'
                        }`}
                      >
                        {s.name}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={applySearch} disabled={candidatesQuery.isFetching}>
              {candidatesQuery.isFetching ? 'Searching…' : 'Apply search'}
            </Button>
            <Button variant="ghost" onClick={clearSearch}>
              Reset
            </Button>
          </div>
        </section>

        <div className="mb-10">
          <SkillCatalog skills={skills} isLoading={skillsQuery.isLoading} onNotify={notify} />
        </div>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">Candidates</h2>
              <p className="text-sm text-zinc-500">{list.length} result(s)</p>
            </div>
          </div>

          {candidatesQuery.isError && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {(candidatesQuery.error as Error).message}
            </p>
          )}

          {candidatesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5 ring-1 ring-white/10" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <div key={c.id} className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <CandidateCard candidate={c} onEdit={openEdit} onDelete={confirmDelete} />
                </div>
              ))}
            </div>
          )}

          {!candidatesQuery.isLoading && list.length === 0 && !candidatesQuery.isError && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
              <p className="font-display text-lg text-zinc-400">No candidates match this filter.</p>
              <p className="mt-2 text-sm text-zinc-600">Try clearing search or seed the database (restart API with empty DB).</p>
            </div>
          )}
        </section>
      </main>

      <CandidateModal
        open={modalOpen}
        mode={modalMode}
        candidate={editing}
        allSkills={skills}
        onClose={() => setModalOpen(false)}
        onNotify={notify}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] max-w-sm rounded-2xl px-5 py-4 text-sm font-medium shadow-2xl ring-1 ${
            toast.kind === 'err'
              ? 'bg-rose-950/95 text-rose-100 ring-rose-500/40'
              : 'bg-zinc-900/95 text-white ring-cyan-500/30'
          }`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
