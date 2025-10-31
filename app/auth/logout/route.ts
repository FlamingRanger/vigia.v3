import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/auth/login", { base: process.env.NEXT_PUBLIC_APP_URL }), {
    status: 302,
  })
}
