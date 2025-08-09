"use client"

import { create } from "zustand"

type User = {
  id: string // 新增用户ID
  name: string
  email: string
  education: string
  careerGoal?: string
  resumeUrl?: string | null // 新增简历URL
}

type State = {
  user: User | null
  loading: boolean
  login: (u: User) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useUserStore = create<State>((set) => ({
  user: null,
  loading: false,
  setLoading: (v) => set({ loading: v }),
  login: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}))
