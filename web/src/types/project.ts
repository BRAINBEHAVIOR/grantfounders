import { AceScoreResult } from "./ace"

export type ProjectSector = "gov" | "health" | "bank" | "fund"

export type Project = {
  id: string
  name: string
  sector: ProjectSector
  budget: number
  duration_months: number
  beneficiaries: number
  owner_org_id?: string
}

export type ProjectScorecard = {
  project_id: string
  snapshot_at: string
  score: AceScoreResult
}
