import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"
import { CONVERSION_RATE, CURRENCY } from "@/lib/currency"

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
    const burnAmountVT = Number(body.amount_vt) || 0

    // Validate burn amount
    if (burnAmountVT <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    if (burnAmountVT < CONVERSION_RATE) {
      return NextResponse.json(
        { error: `Minimum burn amount is ${CONVERSION_RATE} Vigia Tokens (1 API Credit)` },
        { status: 400 },
      )
    }

    // Get current user balance
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("points, credits")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (userData.points < burnAmountVT) {
      return NextResponse.json({ error: "Insufficient Vigia Tokens" }, { status: 400 })
    }

    // Calculate conversion (10 Vigia Tokens = 1 API Credit)
    const earnedCredits = burnAmountVT / CONVERSION_RATE
    const newPoints = userData.points - burnAmountVT
    const newCredits = userData.credits + earnedCredits

    const { error: updateError } = await supabase
      .from("users")
      .update({
        points: newPoints,
        credits: newCredits,
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log Vigia Token burn transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      transaction_type: "burn_points",
      amount: burnAmountVT,
      balance_before: userData.points,
      balance_after: newPoints,
      metadata: {
        currency_from: CURRENCY.VT,
        currency_to: CURRENCY.AC,
        conversion_rate: CONVERSION_RATE,
        ac_earned: earnedCredits,
      },
    })

    return NextResponse.json(
      {
        success: true,
        vt_burned: burnAmountVT,
        ac_earned: earnedCredits,
        new_balances: {
          points: newPoints,
          credits: newCredits,
        },
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
