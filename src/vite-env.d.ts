/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_MCP_SERVER_URL?: string
  readonly VITE_USE_MCP_CATEGORY_FETCH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

