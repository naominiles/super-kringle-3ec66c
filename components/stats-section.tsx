"use client"

import useSWR from "swr"
import { type CaseRecord } from "@/lib/data"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function StatsSection() {
  const { data } = useSWR<{ cases: CaseRecord[] }>("/api/cases", fetcher, {
    revalidateOnFocus: false,
  })

  const cases = data?.cases ?? []
  const totalCases = cases.length
  const totalStates = new Set(cases.map((c) => c.state)).size

  // Extract years from date strings
  const years = cases
    .map((c) => {
      const match = c.date?.match(/\d{4}/)
      return match ? parseInt(match[0], 10) : null
    })
    .filter((y): y is number => y !== null)

  const minYear = years.length > 0 ? Math.min(...years) : 0
  const maxYear = years.length > 0 ? Math.max(...years) : 0
  const span = maxYear - minYear

  const stats = [
    { value: totalCases > 0 ? totalCases.toString() : "--", label: "Documented Cases" },
    { value: totalStates > 0 ? totalStates.toString() : "--", label: "States Represented" },
    { value: span > 0 ? `${span}+` : "--", label: "Years Spanning" },
  ]

  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px bg-border sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center bg-background px-6 py-12"
          >
            <span className="font-serif text-4xl font-bold text-primary md:text-5xl">
              {stat.value}
            </span>
            <span className="mt-2 text-sm tracking-wide text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
