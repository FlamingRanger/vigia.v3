import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

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
      .from("dataset_orders")
      .select("*")
      .eq("buyer_id", user.id)
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

    // Verify dataset exists and get price
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("price_in_credits")
      .eq("id", body.dataset_id)
      .single()

    if (datasetError) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // Check user has enough credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (userError || userData.credits < dataset.price_in_credits) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("dataset_orders")
      .insert({
        buyer_id: user.id,
        dataset_id: body.dataset_id,
        price_paid: dataset.price_in_credits,
        status: "completed",
        download_url: "https://data.example.com/dataset_" + Date.now() + ".zip",
      })
      .select()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Deduct credits
    await supabase
      .from("users")
      .update({
        credits: userData.credits - dataset.price_in_credits,
      })
      .eq("id", user.id)

    // Log transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      transaction_type: "marketplace_purchase",
      amount: dataset.price_in_credits,
      balance_before: userData.credits,
      balance_after: userData.credits - dataset.price_in_credits,
      metadata: { dataset_id: body.dataset_id },
    })

    return NextResponse.json(order[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
