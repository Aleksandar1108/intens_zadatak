export type Skill = {
  id: number
  name: string
}

export type Candidate = {
  id: number
  fullName: string
  dateOfBirth: string
  contactNumber: string
  email: string
  skills: Skill[]
}

export type CreateCandidateBody = {
  fullName: string
  dateOfBirth: string
  contactNumber: string
  email: string
  skillIds?: number[]
}

export type UpdateCandidateBody = {
  fullName: string
  dateOfBirth: string
  contactNumber: string
  email: string
}
