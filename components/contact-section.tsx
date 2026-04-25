"use client"

import { useState, useEffect, useRef } from "react"
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react"

interface ContactSectionProps {
  prefillSubject?: string
  prefillMessage?: string
  onRendered?: () => void
}

export function ContactSection({ prefillSubject, prefillMessage, onRendered }: ContactSectionProps) {
  const calledRef = useRef(false)

  useEffect(() => {
    if (onRendered && !calledRef.current) {
      calledRef.current = true
      onRendered()
    }
  }, [onRendered])
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Something went wrong.")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-xl px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Thank you for reaching out
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            We have received your message and will respond as soon as possible.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-8">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          Contact Us
        </h2>
      </div>

      <p className="mt-4 leading-relaxed text-muted-foreground">
        Have a question, correction, or want to get involved? We welcome
        inquiries from researchers, journalists, church leaders, community
        members, and anyone interested in supporting this work.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-name"
            className="text-xs font-medium uppercase tracking-wider text-foreground"
          >
            Name <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-email"
            className="text-xs font-medium uppercase tracking-wider text-foreground"
          >
            Email <span className="text-primary">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-subject"
            className="text-xs font-medium uppercase tracking-wider text-foreground"
          >
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            defaultValue={prefillSubject === "Data Correction" ? "correction" : ""}
            className="w-full bg-card px-4 py-2.5 text-sm text-foreground border border-border focus:border-primary focus:outline-none [color-scheme:dark]"
          >
            <option value="" disabled>
              Select a topic...
            </option>
            <option value="general">General Inquiry</option>
            <option value="correction">Data Correction / Flag an Error</option>
            <option value="research">Research Collaboration</option>
            <option value="media">Media / Press Inquiry</option>
            <option value="volunteer">Volunteering / Getting Involved</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-message"
            className="text-xs font-medium uppercase tracking-wider text-foreground"
          >
            Message <span className="text-primary">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            defaultValue={prefillMessage ?? ""}
            placeholder="Tell us how we can help, or share any information you have..."
            className="w-full resize-y bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="mt-2 flex items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </button>
      </form>

      <div className="mt-10 border-t border-border pt-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          You can also reach us directly at{" "}
          <a
            href="mailto:contact@blackchurchburning.org"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            contact@blackchurchburning.org
          </a>
        </p>
      </div>
    </section>
  )
}
