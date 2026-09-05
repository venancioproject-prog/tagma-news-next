import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Retorna o cliente do Supabase com validação estrita das variáveis de ambiente.
 * Se as credenciais estiverem ausentes, emite aviso claro no log e retorna null
 * permitindo fallback gracioso ou tratamento com mensagens explicativas.
 */
export function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || typeof url !== 'string' || !url.trim()) {
    console.error(
      '[CRÍTICO SUPABASE] A variável NEXT_PUBLIC_SUPABASE_URL não está configurada ou está vazia no ambiente.'
    )
    return null
  }

  if (!key || typeof key !== 'string' || !key.trim()) {
    console.error(
      '[CRÍTICO SUPABASE] A variável NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada ou está vazia no ambiente.'
    )
    return null
  }

  try {
    return createSupabaseClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  } catch (err: any) {
    console.error('[ERRO SUPABASE INIT] Falha ao instanciar createClient:', err.message || err)
    return null
  }
}
