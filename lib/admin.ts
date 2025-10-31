import { createClient } from "@supabase/supabase-js"

/**
 * Admin client for server-side operations with elevated privileges
 * Only use for admin-specific operations
 */
export const createAdminClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
