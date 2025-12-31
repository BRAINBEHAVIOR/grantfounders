export type ManusUser = {
  id?: string
  name: string
  organization: string
  plan?: string
  subscription: {
    plan: string
    monthly_evaluations_used: number
    monthly_evaluations_limit: number
  }
  quota?: number
}

export const MANUS_DEMO_USER: ManusUser = {
  id: "demo",
  name: "Ava Quantum",
  organization: "GrantFounders Labs",
  plan: "pro",
  subscription: {
    plan: "pro",
    monthly_evaluations_used: 0,
    monthly_evaluations_limit: 10,
  },
  quota: 10,
}

export { default as Sidebar } from "./Sidebar"
export { default as Topbar } from "./Topbar"
export { default as Dashboard } from "./Dashboard"
export { default as ProjectList } from "./ProjectList"
export { default as ProjectEvaluation } from "./ProjectEvaluation"
export { default as Analytics } from "./Analytics"
export { default as Billing } from "./Billing"
export { default as Settings } from "./Settings"
