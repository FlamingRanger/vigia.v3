"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ShoppingCart } from "lucide-react"

interface Dataset {
  id: string
  name: string
  description: string
  price_credits: number
  event_count: number
  region: string
}

export default function Marketplace() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [orderReceipt, setOrderReceipt] = useState<any>(null)

  useEffect(() => {
    const fetchDatasets = async () => {
      const res = await fetch("/api/datasets")
      const data = await res.json()
      setDatasets(data)
    }
    fetchDatasets()
  }, [])

  const handleBuy = async (dataset: Dataset) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: dataset.id,
        quantity: 1,
        total_cost: dataset.price_credits,
      }),
    })
    const order = await res.json()
    setOrderReceipt(order)
    setSelectedDataset(null)
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Data Marketplace</h1>
          <p className="text-muted-foreground text-lg">Purchase high-quality infrastructure datasets</p>
        </div>

        {/* Order Receipt Modal */}
        {orderReceipt && (
          <div className="glass-card p-8 mb-8 border-accent/50">
            <h3 className="text-2xl font-bold mb-4 text-accent">Order Completed</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono text-foreground">{orderReceipt.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Download URL</p>
                <p className="font-mono text-accent truncate">{orderReceipt.download_url}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Cost</p>
                <p className="font-bold text-foreground">{orderReceipt.total_cost} CR</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-bold text-accent uppercase">{orderReceipt.status}</p>
              </div>
            </div>
            <button
              onClick={() => setOrderReceipt(null)}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Close
            </button>
          </div>
        )}

        {/* Dataset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="glass-card p-6 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{dataset.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">{dataset.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-muted-foreground text-xs">Events</p>
                  <p className="font-bold text-foreground">{dataset.event_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Region</p>
                  <p className="font-bold text-foreground">{dataset.region}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="stat-value text-2xl">{dataset.price_credits}</div>
                <span className="text-muted-foreground text-sm">CR</span>
              </div>

              <button
                onClick={() => handleBuy(dataset)}
                className="mt-4 w-full glass-button py-3 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase Dataset
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
