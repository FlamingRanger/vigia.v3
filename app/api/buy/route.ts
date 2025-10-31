import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"
import { validatePurchaseAmount, calculatePurchaseCost, PAYMENT, CURRENCY } from "@/lib/currency"

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
    const buyAmountAC = Number(body.amount_ac) || 0

    // Validate purchase amount
    const validation = validatePurchaseAmount(buyAmountAC)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    // Get current user credits
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const newCredits = userData.credits + buyAmountAC
    const costINR = calculatePurchaseCost(buyAmountAC)

    // Simulate payment processing
    const paymentMethod = body.payment_method || "UPI" // UPI, Card, Wallet, etc.
    const txnId = `INR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // In production, integrate with actual payment gateway (Razorpay, Stripe, etc.)
    // For now, simulate successful payment

    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: newCredits,
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log API Credit purchase transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      transaction_type: "buy_credits",
      amount: buyAmountAC,
      balance_before: userData.credits,
      balance_after: newCredits,
      metadata: {
        currency: CURRENCY.AC,
        payment_method: paymentMethod,
        payment_currency: PAYMENT.CURRENCY,
        cost_inr: costINR,
        rate_per_ac: PAYMENT.RATE_PER_AC,
      },
    })

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: txnId,
          amount_ac: buyAmountAC,
          cost_inr: costINR,
          payment_method: paymentMethod,
          status: "completed",
        },
        invoice_url: `https://vigia.in/invoice/${txnId}`,
        new_balance: {
          credits: newCredits,
        },
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
