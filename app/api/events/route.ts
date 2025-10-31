import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"
import { calculateHazardReward } from "@/lib/currency"

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

    // Get device to verify ownership
    const { data: device } = await supabase.from("devices").select("id").eq("id", body.device_id).single()

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Create the event
    const { data: eventData, error } = await supabase
      .from("events")
      .insert({
        device_id: body.device_id,
        user_id: user.id,
        event_type: body.event_type,
        severity: body.severity,
        latitude: body.latitude,
        longitude: body.longitude,
        metadata: body.metadata || {},
        confidence_score: body.confidence_score,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate and mint Vigia Tokens for validated hazard event
    const vtReward = calculateHazardReward(body.event_type, body.severity, body.confidence_score || 0, false)
    
    if (vtReward > 0) {
      // Update user points and total hazards count
      const { data: userCurrent } = await supabase
        .from("users")
        .select("points, total_hazards_detected")
        .eq("id", user.id)
        .single()

      await supabase
        .from("users")
        .update({
          points: (userCurrent?.points || 0) + vtReward,
          total_hazards_detected: (userCurrent?.total_hazards_detected || 0) + 1,
        })
        .eq("id", user.id)

      // Log Vigia Token minting transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "rewards",
        amount: vtReward,
        balance_before: userCurrent?.points || 0,
        balance_after: (userCurrent?.points || 0) + vtReward,
        metadata: {
          currency: "VT",
          event_id: eventData[0].id,
          event_type: body.event_type,
          severity: body.severity,
          confidence: body.confidence_score,
        },
      })
    }

    return NextResponse.json({ ...eventData[0], vt_reward: vtReward }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

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
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
