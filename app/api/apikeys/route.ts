import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, scopes, is_active, last_used_at, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Generate API key
    const rawKey = "sk_live_" + crypto.randomBytes(20).toString("hex")
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name: body.name || "New API Key",
        key_hash: keyHash,
        scopes: body.scopes || ["read:events", "write:events"],
      })
      .select("id, name, scopes, is_active, created_at, expires_at")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Only return the raw key once, on creation
    return NextResponse.json(
      {
        ...data[0],
        key: rawKey,
        warning: "Save this key somewhere safe. You won't be able to see it again.",
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
