"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/burn-buy", label: "Burn & Buy" },
  { href: "/moderation", label: "Moderation" },
  { href: "/api-keys", label: "API & Keys" },
  { href: "/ledger", label: "Ledger" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 glass-card m-4 mb-6 flex gap-2 p-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
