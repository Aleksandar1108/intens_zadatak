import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { hrApi } from '../api/hrApi'
import type { Candidate, Skill } from '../api/types'
import { Button } from './Button'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  candidate: Candidate | null
  allSkills: Skill[]
  onClose: () => void
  onNotify: (msg: string, kind?: 'ok' | 'err') => void
}

export function CandidateModal({ open, mode, candidate, allSkills, onClose, onNotify }: Props) {
  const qc = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCreateSkills, setSelectedCreateSkills] = useState<Set<number>>(new Set())

  const detailQuery = useQuery({
    queryKey: ['candidate', candidate?.id],
    queryFn: () => hrApi.candidates.get(candidate!.id),
    enabled: open && mode === 'edit' && !!candidate,
  })

  const live = mode === 'edit' && detailQuery.data ? detailQuery.data : candidate

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setFullName('')
      setDateOfBirth('')
      setContactNumber('')
      setEmail('')
      setSelectedCreateSkills(new Set())
      return
    }
    const src = detailQuery.data ?? candidate
    if (src) {
      setFullName(src.fullName)
      setDateOfBirth(src.dateOfBirth)
      setContactNumber(src.contactNumber)
      setEmail(src.email)
    }
  }, [open, mode, candidate, detailQuery.data])

  const createMut = useMutation({
    mutationFn: () =>
      hrApi.candidates.create({
        fullName,
        dateOfBirth,
        contactNumber,
        email,
        skillIds: [...selectedCreateSkills],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      onNotify('Candidate created')
      onClose()
    },
    onError: (e: Error) => onNotify(e.message, 'err'),
  })

  const updateMut = useMutation({
    mutationFn: () =>
      hrApi.candidates.update(live!.id, {
        fullName,
        dateOfBirth,
        contactNumber,
        email,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      await qc.invalidateQueries({ queryKey: ['candidate', live?.id] })
      onNotify('Profile updated')
    },
    onError: (e: Error) => onNotify(e.message, 'err'),
  })

  const addSkillMut = useMutation({
    mutationFn: (skillId: number) => hrApi.candidates.addSkill(live!.id, skillId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      await qc.invalidateQueries({ queryKey: ['candidate', live?.id] })
      onNotify('Skill linked')
    },
    onError: (e: Error) => onNotify(e.message, 'err'),
  })

  const removeSkillMut = useMutation({
    mutationFn: (skillId: number) => hrApi.candidates.removeSkill(live!.id, skillId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      await qc.invalidateQueries({ queryKey: ['candidate', live?.id] })
      onNotify('Skill removed')
    },
    onError: (e: Error) => onNotify(e.message, 'err'),
  })

  const addableSkills = useMemo(() => {
    if (!live) return allSkills
    const have = new Set(live.skills.map((s) => s.id))
    return allSkills.filter((s) => !have.has(s.id))
  }, [allSkills, live])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl glass p-6 shadow-2xl shadow-black/50 ring-1 ring-white/10"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              {mode === 'create' ? 'New candidate' : 'Edit candidate'}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === 'create' ? 'Add someone to your talent pool.' : 'Update profile and skill assignments.'}
            </p>
          </div>
          <Button variant="subtle" className="!rounded-lg !p-2" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

        {mode === 'edit' && detailQuery.isLoading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : (
          <>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Full name</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Date of birth</span>
                <input
                  type="date"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Contact</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Email</span>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-cyan-500/40 focus:ring-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
            </div>

            {mode === 'create' && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Initial skills</p>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-3">
                  {allSkills.length === 0 ? (
                    <p className="text-sm text-zinc-500">Add skills in the catalog first.</p>
                  ) : (
                    allSkills.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-white/20 bg-black/50 text-cyan-500"
                          checked={selectedCreateSkills.has(s.id)}
                          onChange={() => {
                            setSelectedCreateSkills((prev) => {
                              const n = new Set(prev)
                              if (n.has(s.id)) n.delete(s.id)
                              else n.add(s.id)
                              return n
                            })
                          }}
                        />
                        <span className="text-sm text-zinc-200">{s.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {mode === 'create' ? (
                <Button
                  className="min-w-[120px]"
                  disabled={createMut.isPending}
                  onClick={() => createMut.mutate()}
                >
                  {createMut.isPending ? 'Saving…' : 'Create'}
                </Button>
              ) : (
                <Button className="min-w-[120px]" disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>
                  {updateMut.isPending ? 'Saving…' : 'Save profile'}
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>

            {mode === 'edit' && live && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Linked skills</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {live.skills.length === 0 ? (
                    <span className="text-sm text-zinc-600">None yet</span>
                  ) : (
                    live.skills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-xs text-violet-200 ring-1 ring-violet-500/25"
                      >
                        {s.name}
                        <button
                          type="button"
                          className="ml-1 rounded px-1 text-violet-300 hover:bg-violet-500/30 hover:text-white"
                          title="Remove"
                          onClick={() => removeSkillMut.mutate(s.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                {addableSkills.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-zinc-500">Add:</span>
                    <select
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      defaultValue=""
                      onChange={(e) => {
                        const id = Number(e.target.value)
                        if (!id) return
                        addSkillMut.mutate(id)
                        e.target.value = ''
                      }}
                    >
                      <option value="">Choose skill…</option>
                      {addableSkills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">All catalog skills are already assigned.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
