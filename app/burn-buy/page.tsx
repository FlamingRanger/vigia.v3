"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Wallet, TrendingDown } from "lucide-react"

interface Ledger {
  id: string
  type: string
  amount: number
  points_type: string
  description: string
  timestamp: string
}

export default function BurnBuy() {
  const [wallet, setWallet] = useState({ credit_points: 0, credits: 0 })
  const [ledger, setLedger] = useState<Ledger[]>([])
  const [burnAmount, setBurnAmount] = useState("50")
  const [buyAmount, setBuyAmount] = useState("100")

  useEffect(() => {
    const fetchData = async () => {
      const walletRes = await fetch("/api/wallet")
      const ledgerRes = await fetch("/api/ledger?limit=10")
      setWallet(await walletRes.json())
      setLedger(await ledgerRes.json())
    }
    fetchData()
  }, [])

  const handleBurn = async () => {
    const res = await fetch("/api/burn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cp: Number.parseInt(burnAmount) }),
    })
    const result = await res.json()
    if (result.success) {
      setWallet({ credit_points: result.points, credits: result.credits })
      setBurnAmount("50")
    }
  }

  const handleBuyCredits = async () => {
    const res = await fetch("/api/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cr: Number.parseInt(buyAmount) }),
    })
    const result = await res.json()
    if (result.success) {
      alert(`Payment initiated: ${result.txn_id}`)
      setBuyAmount("100")
    }
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Burn & Buy</h1>
          <p className="text-muted-foreground text-lg">Manage your crypto points and credits</p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Credit Points</h2>
            </div>
            <p className="stat-value mb-2">{wallet.credit_points}</p>
            <p className="text-muted-foreground">CP Balance</p>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Credits</h2>
            </div>
            <p className="stat-value mb-2">{wallet.credits}</p>
            <p className="text-muted-foreground">CR Balance</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Burn Points */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Burn Points
            </h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Irreversibly convert credit points to credits (1 CP = 0.1 CR)
              </p>
              <input
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-white/10"
                placeholder="Amount to burn"
              />
              <button onClick={handleBurn} className="w-full glass-button py-3 font-bold">
                Confirm Burn
              </button>
            </div>
          </div>

          {/* Buy Credits */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Buy Credits
            </h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">Purchase credits using simulated payment</p>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-white/10"
                placeholder="Amount to buy"
              />
              <button onClick={handleBuyCredits} className="w-full glass-button py-3 font-bold">
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          <div className="space-y-3">
            {ledger.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-bold text-foreground capitalize">
                    {entry.type}: {entry.description}
                  </p>
                  <p className="text-muted-foreground text-sm">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {entry.type === "burn" ? "-" : "+"}
                    {entry.amount} {entry.points_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
