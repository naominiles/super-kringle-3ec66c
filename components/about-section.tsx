"use client"

import { useState } from "react"
import { Facebook, Twitter, Link, Check } from "lucide-react"

interface AboutSectionProps {
  onNavigate?: (view: string) => void
}

export function AboutSection({ onNavigate }: AboutSectionProps) {
  const [copied, setCopied] = useState(false)

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareText = "The Black Church Burning Project — documenting the history of attacks on Black churches in the South during the civil rights era."
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://blackchurchburningproject.org"

  return (
    <section className="prose-content mx-auto max-w-2xl px-6 py-8">
      {/* Mission Statement */}
      <div className="border-l-2 border-primary bg-card px-5 py-4">
        <h2 className="font-serif text-lg font-bold text-foreground">
          Mission Statement
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          The Black Church Burning Project exists to identify and document every
          Black church and congregation that was burned, bombed, or otherwise
          attacked during the Civil Rights era -- and to bring these forgotten
          stories forward for scholars, communities, and the public.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-8 leading-relaxed text-muted-foreground">
        {/* About the Project */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            About the Project
          </h2>
          <p className="mt-4">
            The purpose of the Black Church Burning Project is primarily to
            identify and document every Black church and congregation that was
            burned, bombed or otherwise attacked during the Civil Rights era.
          </p>
          <p className="mt-4">
            The project is motivated by the fact that the Black Church,
            especially in the late twentieth century, has been the heart of the
            Black community and the center of civic engagement. It was also the
            backbone and key infrastructure for civil rights organizing and
            resistance at both the local and national level. Given their crucial
            role in the Civil Rights Movement and centrality for the Black
            community, Black congregations became targets for racially motivated
            violence and terrorism from white supremacists and hate groups.
          </p>
          <p className="mt-4 font-medium text-foreground/90">
            Yet this story has gone untold.
          </p>
          <p className="mt-4">
            The bombings and burnings of Black churches have not been studied by
            scholars of racial violence, nor has this received the widespread
            public attention it deserves. These stories have been lost to
            history; they live on only in congregational records and church
            bulletins, survivor&apos;s childhood memories, and local lore.
          </p>
          <p className="mt-4 font-medium text-foreground/90">
            Our goal at the Black Church Burning Project is to bring these
            stories forward, to connect local congregational and family histories
            to the broader struggle for civil rights and the violent backlash
            against it.
          </p>
          <p className="mt-4">
            To do this we will engage in the following activities:
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Identify and document every case possible and present them
                interactively so that visitors to the website can engage with
                this history.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Tell the in-depth stories where living memory and congregational
                records persist as testament to the resilience of the Black
                community and testimony against the perpetrators of racial
                terrorism.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Seek to memorialize these events in the community in partnership
                with congregations that were targeted so that local communities
                can reckon with the history of racial injustice and violence.
              </span>
            </li>
          </ul>
        </div>

        <div className="h-px w-full bg-border" aria-hidden="true" />

        {/* How You Can Contribute */}
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            How You Can Contribute
          </h3>
          <p className="mt-3">
            If your congregation or a congregation that you know of experienced
            a burning, bombing, or attempted attack during the Civil Rights Era,
            please share what you can. No detail is too small. If you have a
            story, we want to help you tell it.
          </p>
          <div className="mt-5 flex flex-col divide-y divide-border border border-border">

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Submit a Case</p>
              <p className="mt-1 text-sm">
                Know of a congregation that was attacked?{" "}
                <button
                  onClick={() => onNavigate?.("submit")}
                  className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
                >
                  Use our online form
                </button>{" "}
                to share what you know. No detail is too small.
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Share Stories or Documents</p>
              <p className="mt-1 text-sm">
                Email us church histories, oral stories, bulletins, or documents
                at{" "}
                <a
                  href="mailto:contact@blackchurchburning.org"
                  className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
                >
                  contact@blackchurchburning.org
                </a>
                .
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Make an Introduction</p>
              <p className="mt-1 text-sm">
                Connect us with pastors, archivists, or elders who hold this
                history. An introduction can open doors that research alone cannot.
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Correct or Add Details</p>
              <p className="mt-1 text-sm">
                If you have more accurate or additional details about a case
                we&apos;ve already identified, please{" "}
                <button
                  onClick={() => onNavigate?.("contact")}
                  className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
                >
                  contact us
                </button>
                .
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Spread the Word</p>
              <p className="mt-1 text-sm">Share this website with your community.</p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors no-underline"
                >
                  <Facebook className="h-3 w-3" />
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors no-underline"
                >
                  <Twitter className="h-3 w-3" />
                  X
                </a>
                <button
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-primary" /> : <Link className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            <div className="px-4 py-4">
              <p className="font-medium text-foreground">Donate</p>
              <p className="mt-1 text-sm">Support the work with a donation.</p>
              <div className="mt-2">
                <button
                  onClick={() => onNavigate?.("donate")}
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Donate
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="h-px w-full bg-border" aria-hidden="true" />

        {/* Who We Are */}
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            Who We Are
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">
                  Project Director &amp; Primary Investigator:
                </strong>{" "}
                <a href="https://www.jasonwollschleger.com" target="_blank" rel="noopener noreferrer">Jason Wollschleger</a>, PhD, MSW. Professor of Sociology at Whitworth
                University.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Web Development:</strong>{" "}
                <a href="https://www.naominiles.com">Naomi Niles</a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Research Assistants:</strong>{" "}
                Courtney Haupt, San Diego State University; Camille Trembley,
                Whitworth University; JC Rawls, Whitworth University; Demilade
                Tope-Babalola, Whitworth University; Molly Wollschleger,
                Vanderbilt University
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
