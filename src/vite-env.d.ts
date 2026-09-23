/// <reference types="vite/client" />

export {}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresTechnician?: boolean
    title?: string
    active?: 'requests' | 'jobs' | 'history' | 'account'
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
