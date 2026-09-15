/// <reference types="vite/client" />

export {}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAdmin?: boolean
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
