"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

interface SiteNavProps {
  currentView: string
  onNavigate: (view: string) => void
}

export function SiteNav({ currentView, onNavigate }: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { id: "home", label: "Home" },
    { id: "map", label: "Map" },
    { id: "submit", label: "Submit a Case" },
    { id: "about", label: "About" },
    { id: "methodology", label: "Data & Methods" },
    { id: "contact", label: "Contact" },
    { id: "donate", label: "Donate" },
  ]

  function handleNav(view: string) {
    onNavigate(view)
    setMobileOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          onClick={() => handleNav("home")}
          className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          Black Church Burning Project
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.slice(1).map((link) => (
            <li key={link.id}>
              <button
                onClick={() => handleNav(link.id)}
                className={`text-sm tracking-wide transition-colors ${
                  currentView === link.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-muted-foreground md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 pt-3">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNav(link.id)}
                  className={`block w-full text-left text-sm tracking-wide transition-colors ${
                    currentView === link.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
