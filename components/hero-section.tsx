"use client"

import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  onNavigate: (view: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background image */}
      <img
        src="/images/hero-church.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/85" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
          Black Church
          <br />
          Burning Project
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-primary" aria-hidden="true" />

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl">
          A digital archive and public history project.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onNavigate("map")}
            className="group flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore the Map
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => onNavigate("submit")}
            className="flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium tracking-wide text-foreground transition-colors hover:border-muted-foreground"
          >
            Submit a Case
          </button>
        </div>
      </div>
    </section>
  )
}
