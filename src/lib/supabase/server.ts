import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    console.error('[CRÍTICO SUPABASE] NEXT_PUBLIC_SUPABASE_URL não configurada no servidor SSR.')
  }
  if (!key) {
    console.error('[CRÍTICO SUPABASE] NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada no servidor SSR.')
  }

  return createServerClient(
    url || '',
    key || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorado em Server Components
          }
        },
      },
    }
  )
}
