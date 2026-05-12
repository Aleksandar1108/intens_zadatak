import type { Candidate, CreateCandidateBody, Skill, UpdateCandidateBody } from './types'

function apiBase(): string {
  const v = import.meta.env.VITE_API_URL
  if (typeof v === 'string' && v.length > 0) {
    return v.replace(/\/$/, '')
  }
  return ''
}

async function readError(res: Response): Promise<string> {
  try {
    const j: unknown = await res.json()
    if (j && typeof j === 'object' && 'detail' in j && typeof (j as { detail: unknown }).detail === 'string') {
      return (j as { detail: string }).detail
    }
    if (j && typeof j === 'object' && 'title' in j && typeof (j as { title: unknown }).title === 'string') {
      return (j as { title: string }).title
    }
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export const hrApi = {
  skills: {
    list: () => jsonFetch<Skill[]>('/api/skills'),
    create: (name: string) =>
      jsonFetch<Skill>('/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
  },

  candidates: {
    search: (name?: string, skillNames?: string[]) => {
      const q = new URLSearchParams()
      if (name?.trim()) q.set('name', name.trim())
      for (const s of skillNames ?? []) {
        if (s.trim()) q.append('skill', s.trim())
      }
      const qs = q.toString()
      return jsonFetch<Candidate[]>(`/api/candidates/search${qs ? `?${qs}` : ''}`)
    },

    get: (id: number) => jsonFetch<Candidate>(`/api/candidates/${id}`),

    create: (body: CreateCandidateBody) =>
      jsonFetch<Candidate>('/api/candidates', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (id: number, body: UpdateCandidateBody) =>
      jsonFetch<Candidate>(`/api/candidates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: (id: number) =>
      jsonFetch<void>(`/api/candidates/${id}`, { method: 'DELETE' }),

    addSkill: (candidateId: number, skillId: number) =>
      jsonFetch<void>(`/api/candidates/${candidateId}/skills`, {
        method: 'POST',
        body: JSON.stringify({ skillId }),
      }),

    removeSkill: (candidateId: number, skillId: number) =>
      jsonFetch<void>(`/api/candidates/${candidateId}/skills/${skillId}`, {
        method: 'DELETE',
      }),
  },
}
