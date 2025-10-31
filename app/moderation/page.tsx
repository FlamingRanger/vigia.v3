"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ModerationItem {
  id: string
  hazard_type: string
  confidence: number
  blur_percentage: number
  status: "pending" | "approved" | "rejected"
  timestamp: string
}

export default function Moderation() {
  const [items, setItems] = useState<ModerationItem[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events")
      const events = await res.json()
      const modItems = events.map((e: any) => ({
        id: e.id,
        hazard_type: e.hazard_type,
        confidence: e.confidence,
        blur_percentage: e.blur_percentage,
        status: e.confidence < 0.7 ? "pending" : "approved",
        timestamp: e.timestamp,
      }))
      setItems(modItems)
    }
    fetchEvents()
  }, [])

  const handleApprove = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, status: "approved" } : item)))
  }

  const handleReject = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)))
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Moderation</h1>
          <p className="text-muted-foreground text-lg">Review and approve low-confidence hazard detections</p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold capitalize">{item.hazard_type}</h3>
                    {item.status === "approved" && <CheckCircle className="w-5 h-5 text-accent" />}
                    {item.status === "rejected" && <XCircle className="w-5 h-5 text-destructive" />}
                    {item.status === "pending" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-muted-foreground text-sm">{new Date(item.timestamp).toLocaleString()}</p>
                </div>

                <div className="text-right ml-6">
                  <p className="text-muted-foreground text-xs">Confidence</p>
                  <p className="stat-value text-2xl">{(item.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Blur Level</p>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${item.blur_percentage}%` }} />
                  </div>
                  <p className="text-foreground text-sm mt-2">{item.blur_percentage}% blurred</p>
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 glass-button py-2 text-accent hover:bg-accent/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex-1 glass-button py-2 text-destructive hover:bg-destructive/20"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
