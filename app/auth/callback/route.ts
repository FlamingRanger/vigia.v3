import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Create user profile in database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
        })
      }

      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.redirect(new URL("/auth/error", request.url))
}
