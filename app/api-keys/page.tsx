"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Copy, Plus, Eye, EyeOff } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  scopes: string[]
  created_at: string
  last_used: string
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const scopeOptions = ["events:read", "events:write", "clusters:read", "wallet:read", "datasets:read"]

  useEffect(() => {
    const fetchKeys = async () => {
      const res = await fetch("/api/apikeys")
      const data = await res.json()
      setKeys(data)
    }
    fetchKeys()
  }, [])

  const handleCreateKey = async () => {
    const res = await fetch("/api/apikeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName, scopes: selectedScopes }),
    })
    const newKey = await res.json()
    setKeys([...keys, newKey])
    setNewKeyName("")
    setSelectedScopes([])
    setShowForm(false)
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    newVisible.has(keyId) ? newVisible.delete(keyId) : newVisible.add(keyId)
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">API & Keys</h1>
          <p className="text-muted-foreground text-lg">Manage your API keys and webhooks</p>
        </div>

        {/* Create Key Form */}
        {showForm && (
          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create New API Key</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name"
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-white/10"
              />

              <div className="bg-white/5 p-4 rounded-lg">
                <p className="font-bold mb-3">Scopes</p>
                <div className="space-y-2">
                  {scopeOptions.map((scope) => (
                    <label key={scope} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope])
                          } else {
                            setSelectedScopes(selectedScopes.filter((s) => s !== scope))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreateKey} className="flex-1 glass-button py-3 font-bold text-accent">
                  Create Key
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 glass-button py-3 font-bold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Key Button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="glass-button px-6 py-3 flex items-center gap-2 mb-8">
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{key.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {key.last_used ? `Last used: ${new Date(key.last_used).toLocaleDateString()}` : "Never used"}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 p-3 bg-input rounded-lg font-mono text-sm">
                <span className="flex-1 truncate">
                  {visibleKeys.has(key.id) ? key.key : key.key.replace(/./g, "*")}
                </span>
                <button onClick={() => toggleKeyVisibility(key.id)} className="p-1 hover:bg-white/10 rounded">
                  {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyToClipboard(key.key)} className="p-1 hover:bg-white/10 rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {key.scopes.map((scope) => (
                  <span key={scope} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
