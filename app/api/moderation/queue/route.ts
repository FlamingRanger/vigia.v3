import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

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
      .from("moderation_queue")
      .select(
        `
        id,
        cluster_id,
        confidence_score,
        status,
        reviewed_by,
        review_notes,
        created_at,
        updated_at,
        hazard_clusters (*)
      `,
      )
      .eq("status", "pending")
      .order("confidence_score", { ascending: true })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
