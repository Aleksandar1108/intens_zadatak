import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { hrApi } from '../api/hrApi'
import type { Skill } from '../api/types'
import { Button } from './Button'

type Props = {
  skills: Skill[]
  isLoading: boolean
  onNotify: (msg: string, kind?: 'ok' | 'err') => void
}

export function SkillCatalog({ skills, isLoading, onNotify }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState('')

  const createMut = useMutation({
    mutationFn: () => hrApi.skills.create(name.trim()),
    onSuccess: async () => {
      setName('')
      await qc.invalidateQueries({ queryKey: ['skills'] })
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      onNotify('Skill added to catalog')
    },
    onError: (e: Error) => onNotify(e.message, 'err'),
  })

  return (
    <section className="rounded-3xl glass p-6 ring-1 ring-white/10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Skill catalog</h2>
          <p className="text-sm text-zinc-500">Shared tags for every candidate — Java, English, React…</p>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          placeholder="New skill name"
          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-cyan-500/40 focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && createMut.mutate()}
        />
        <Button className="shrink-0 sm:min-w-[100px]" disabled={!name.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
          {createMut.isPending ? '…' : 'Add'}
        </Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading skills…</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <li
              key={s.id}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-white/10"
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
