"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Wallet, TrendingUp, Activity, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface KPI {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  created_at: string
}

export default function ProtectedDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [liveFeed, setLiveFeed] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, clustersRes, transactionsRes] = await Promise.all([
          fetch("/api/wallet"),
          fetch("/api/clusters"),
          fetch("/api/transactions"),
        ])

        if (walletRes.status === 401) {
          router.push("/auth/login")
          return
        }

        const wallet = await walletRes.json()
        const clusters = await clustersRes.json()
        const transactions = await transactionsRes.json()

        setKpis([
          {
            label: "Active Devices",
            value: 234,
            icon: Activity,
            trend: "+12%",
          },
          {
            label: "Deduped Hazards",
            value: clusters.length || 0,
            icon: Zap,
          },
          {
            label: "Credit Points",
            value: Number.parseFloat(wallet.points || 0).toFixed(2),
            icon: Wallet,
          },
          {
            label: "Credits",
            value: Number.parseFloat(wallet.credits || 0).toFixed(2),
            icon: TrendingUp,
          },
        ])

        setLiveFeed(transactions.slice(0, 5))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-balance">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Real-time DePIN infrastructure metrics</p>
          </div>
          <Button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" })
              router.push("/auth/login")
            }}
          >
            Logout
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div key={i} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-muted-foreground text-sm font-medium">{kpi.label}</h3>
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="stat-value mb-2">{kpi.value}</p>
                  {kpi.trend && <p className="text-accent text-xs font-medium">{kpi.trend}</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Feed */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading transactions...</p>
          ) : liveFeed.length > 0 ? (
            <div className="space-y-3">
              {liveFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-3 border-b border-white/10 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground text-sm">
                      {item.type.replace(/_/g, " ").toUpperCase()}: {item.amount}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No transactions yet</p>
          )}
        </div>
      </main>
    </div>
  )
}
