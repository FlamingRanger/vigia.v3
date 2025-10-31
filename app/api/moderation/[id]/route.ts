import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const { data, error } = await supabase
      .from("moderation_queue")
      .update({
        status: body.status,
        reviewed_by: user.id,
        review_notes: body.review_notes,
      })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If approved, mark the cluster as approved
    if (body.status === "approved" && data[0]) {
      await supabase.from("hazard_clusters").update({ is_approved: true }).eq("id", data[0].cluster_id)
    }

    return NextResponse.json(data[0])
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
