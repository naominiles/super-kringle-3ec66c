"use client"

import { useState } from "react"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { incidentTypes } from "@/lib/data"

export function SubmitForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage("")

    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      churchName: formData.get("churchName") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      date: formData.get("date") as string,
      dateNotes: formData.get("dateNotes") as string,
      incidentType: formData.get("incidentType") as string,
      description: formData.get("description") as string,
      legalOutcome: formData.get("legalOutcome") as string,
      sources: formData.get("sources") as string,
      email: formData.get("email") as string,
    }

    try {
      const response = await fetch("/api/cases/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Submission failed")
      }

      setSubmitted(true)
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">
          Submission Received
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you. Your submission will be reviewed by our research team before
          being added to the archive. If you provided an email, we may follow up
          with questions.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 border border-border px-6 py-2.5 text-sm text-foreground transition-colors hover:border-muted-foreground"
        >
          Submit Another Case
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-8">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Submit a Case
      </h2>

      <div className="mt-4 border-l-2 border-primary bg-card px-4 py-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          All submissions are reviewed before being added to the archive. We
          welcome documentation of any attack on a Black house of worship in the
          United States, regardless of era.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <FormField label="Church Name" required>
          <input
            name="churchName"
            type="text"
            required
            placeholder="e.g. First Baptist Church"
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="City" required>
            <input
              name="city"
              type="text"
              required
              placeholder="e.g. Birmingham"
              className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
            />
          </FormField>
          <FormField label="State" required>
            <input
              name="state"
              type="text"
              required
              placeholder="e.g. Alabama"
              className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Date" hint="Use Date Notes for approximate dates">
            <input
              name="date"
              type="date"
              className="w-full bg-card px-4 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none [color-scheme:dark]"
            />
          </FormField>
          <FormField label="Incident Type" hint="Select the type that best describes the attack" required>
            <select
              name="incidentType"
              required
              defaultValue=""
              className="w-full bg-card px-4 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none"
            >
              <option value="" disabled>
                Select type...
              </option>
              {incidentTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Date Notes" hint="Any context about the date if approximate">
          <input
            name="dateNotes"
            type="text"
            placeholder="e.g. Exact date unknown, summer of 1964"
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <FormField label="Description" required>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe the incident in as much detail as you can. Include context about the church, community, and circumstances."
            className="w-full resize-y bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <FormField label="Legal Outcome" hint="Arrests, convictions, ongoing investigations">
          <textarea
            name="legalOutcome"
            rows={2}
            placeholder="Describe the legal outcome, if any"
            className="w-full resize-y bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <FormField
          label="Sources"
          hint="News articles, court records, oral histories, etc."
        >
          <textarea
            name="sources"
            rows={3}
            placeholder="List any sources, links, or references that document this incident."
            className="w-full resize-y bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <FormField
          label="Email"
          hint="Leave your email if you're open to follow-up questions"
        >
          <input
            name="email"
            type="email"
            placeholder="your@email.com (optional)"
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Submitting..." : "Submit Case"}
        </button>
      </form>
    </section>
  )
}

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}
