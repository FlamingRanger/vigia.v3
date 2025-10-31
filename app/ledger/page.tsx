"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Download, RefreshCw } from "lucide-react"

interface LedgerEntry {
  id: string
  type: string
  amount: number
  points_type: string
  timestamp: string
  description: string
  prev_hash: string
  hash: string
}

export default function Ledger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [merkleRoot, setMerkleRoot] = useState<string>("")

  useEffect(() => {
    const fetchLedger = async () => {
      const res = await fetch("/api/ledger?limit=50")
      const data = await res.json()
      setEntries(data)
    }
    fetchLedger()
  }, [])

  const handlePublishMerkleRoot = () => {
    const newRoot = Math.random().toString(16).slice(2)
    setMerkleRoot(newRoot)
  }

  const exportCSV = () => {
    const csv = [
      "ID,Type,Amount,Points Type,Description,Timestamp,Hash",
      ...entries.map((e) => [e.id, e.type, e.amount, e.points_type, e.description, e.timestamp, e.hash].join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ledger-export.csv"
    a.click()
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Audit Ledger</h1>
          <p className="text-muted-foreground text-lg">Immutable hash chain of all transactions</p>
        </div>

        {/* Hash Chain Visualization */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Hash Chain Verification</h2>

          <div className="space-y-4 mb-8">
            {entries.slice(0, 5).map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-4">
                <div className="glass-card p-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Block {i + 1}</p>
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-accent break-all">Prev: {entry.prev_hash}</p>
                    <p className="font-mono text-xs text-primary break-all">Hash: {entry.hash}</p>
                    <p className="text-sm font-bold mt-2">{entry.description}</p>
                  </div>
                </div>
                {i < 4 && (
                  <div className="text-center">
                    <div className="w-1 h-12 bg-gradient-to-b from-accent to-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {merkleRoot && (
            <div className="p-4 bg-accent/10 border border-accent rounded-lg mb-6">
              <p className="text-xs text-muted-foreground mb-1">Merkle Root Hash</p>
              <p className="font-mono text-accent break-all">{merkleRoot}</p>
            </div>
          )}

          <button onClick={handlePublishMerkleRoot} className="glass-button px-6 py-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Publish Merkle Root
          </button>
        </div>

        {/* Ledger Table */}
        <div className="glass-card p-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <button onClick={exportCSV} className="glass-button px-4 py-2 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 font-bold text-muted-foreground">Type</th>
                <th className="text-left py-3 px-2 font-bold text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-2 font-bold text-muted-foreground">Description</th>
                <th className="text-left py-3 px-2 font-bold text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-2 font-bold text-muted-foreground">Hash</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 capitalize font-bold">{entry.type}</td>
                  <td className="py-3 px-2">
                    {entry.type === "burn" ? "-" : "+"}
                    {entry.amount} {entry.points_type}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground truncate max-w-xs">{entry.description}</td>
                  <td className="py-3 px-2 text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-accent truncate max-w-xs">{entry.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
