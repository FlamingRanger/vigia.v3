export interface Event {
  id: string
  device_id: string
  hazard_type: "pothole" | "bump" | "crack"
  latitude: number
  longitude: number
  confidence: number
  timestamp: string
  blur_percentage: number
}

export interface Cluster {
  id: string
  hazard_type: string
  latitude: number
  longitude: number
  event_count: number
  severity: "low" | "medium" | "high"
  last_updated: string
}

export interface Wallet {
  user_id: string
  credit_points: number
  credits: number
}

export interface LedgerEntry {
  id: string
  type: "mint" | "burn" | "buy" | "sell"
  amount: number
  points_type: string
  timestamp: string
  description: string
  prev_hash: string
  hash: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  price_credits: number
  event_count: number
  region: string
  created_at: string
}

export interface Order {
  id: string
  dataset_id: string
  user_id: string
  quantity: number
  total_cost: number
  status: "pending" | "completed" | "failed"
  created_at: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  scopes: string[]
  created_at: string
  last_used: string
}

// Mock data
export const mockEvents: Event[] = [
  {
    id: "evt_1",
    device_id: "dev_001",
    hazard_type: "pothole",
    latitude: 19.076,
    longitude: 72.8777,
    confidence: 0.92,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    blur_percentage: 0,
  },
  {
    id: "evt_2",
    device_id: "dev_002",
    hazard_type: "bump",
    latitude: 19.0761,
    longitude: 72.8778,
    confidence: 0.78,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    blur_percentage: 15,
  },
  {
    id: "evt_3",
    device_id: "dev_003",
    hazard_type: "crack",
    latitude: 19.0762,
    longitude: 72.8779,
    confidence: 0.65,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    blur_percentage: 40,
  },
]

export const mockClusters: Cluster[] = [
  {
    id: "cluster_A91",
    hazard_type: "pothole",
    latitude: 19.076,
    longitude: 72.8777,
    event_count: 12,
    severity: "high",
    last_updated: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: "cluster_B22",
    hazard_type: "bump",
    latitude: 19.0761,
    longitude: 72.8778,
    event_count: 8,
    severity: "medium",
    last_updated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]

export const mockWallet: Wallet = {
  user_id: "user_001",
  credit_points: 2450,
  credits: 185,
}

export const mockLedger: LedgerEntry[] = [
  {
    id: "ledger_1",
    type: "mint",
    amount: 10,
    points_type: "CP",
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    description: "Minted for cluster #A91 detection",
    prev_hash: "ab3f9d2e...",
    hash: "c47b1a8e...",
  },
  {
    id: "ledger_2",
    type: "burn",
    amount: 50,
    points_type: "CP",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    description: "Burned for credits",
    prev_hash: "c47b1a8e...",
    hash: "f89d2c3b...",
  },
  {
    id: "ledger_3",
    type: "buy",
    amount: 25,
    points_type: "CR",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    description: "Purchased credits",
    prev_hash: "f89d2c3b...",
    hash: "1a4e5f7c...",
  },
]

export const mockDatasets: Dataset[] = [
  {
    id: "ds_001",
    name: "Mumbai Road Hazards Q4 2024",
    description: "Comprehensive dataset of potholes and road damage from Mumbai",
    price_credits: 50,
    event_count: 5423,
    region: "IN-MH",
    created_at: "2024-10-01",
  },
  {
    id: "ds_002",
    name: "Bangalore Infrastructure Data",
    description: "Road infrastructure anomalies detected in Bangalore",
    price_credits: 35,
    event_count: 3210,
    region: "IN-KA",
    created_at: "2024-09-15",
  },
  {
    id: "ds_003",
    name: "Delhi Traffic & Road Conditions",
    description: "Traffic patterns and road surface quality data",
    price_credits: 75,
    event_count: 8900,
    region: "IN-DL",
    created_at: "2024-10-10",
  },
]

export const mockApiKeys: ApiKey[] = [
  {
    id: "key_001",
    name: "Production API Key",
    key: "sk_live_abcdef123456...",
    scopes: ["events:write", "clusters:read", "wallet:read"],
    created_at: "2024-08-01",
    last_used: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: "key_002",
    name: "Development Key",
    key: "sk_test_xyz789...",
    scopes: ["events:read", "events:write"],
    created_at: "2024-09-01",
    last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]
