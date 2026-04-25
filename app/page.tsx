"use client"

import { useState } from "react"
import { SiteNav } from "@/components/site-nav"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { MapView } from "@/components/map-view"
import { SubmitForm } from "@/components/submit-form"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { MethodologySection } from "@/components/methodology-section"
import { DonateButton } from "@/components/donate-button"
import { DonateSection } from "@/components/donate-section"

export default function Page() {
  const [currentView, setCurrentView] = useState("home")
  const [flaggedChurch, setFlaggedChurch] = useState<string | null>(null)

  function handleFlagError(churchName: string) {
    setFlaggedChurch(churchName)
    setCurrentView("contact")
  }

  return (
    <>
      <SiteNav currentView={currentView} onNavigate={setCurrentView} />
      <main className="pt-[65px]">
        {currentView === "home" && (
          <>
            <HeroSection onNavigate={setCurrentView} />

            {/* Mission statement */}
            <section className="border-y border-border bg-card px-6 py-12">
              <div className="mx-auto max-w-2xl flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="mt-1 h-4 w-1 shrink-0 bg-primary" aria-hidden="true" />
                  <p className="font-serif text-lg text-foreground leading-relaxed">
                    During the Civil Rights era, the Black Church was the backbone of civil rights organizing at the local level.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="mt-1 h-4 w-1 shrink-0 bg-primary" aria-hidden="true" />
                  <p className="font-serif text-lg text-foreground leading-relaxed">
                    Therefore, congregations were targeted for terrorist attacks by white supremacist hate groups.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="mt-1 h-4 w-1 shrink-0 bg-primary" aria-hidden="true" />
                  <p className="font-serif text-lg text-foreground leading-relaxed">
                    We are documenting the history of attacks on Black churches in the South during the Civil Rights era.
                  </p>
                </div>
              </div>
            </section>

            <StatsSection />
            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
              <p>
                Black Church Burning Project &middot; A digital humanities
                archive
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentView("donate")}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Donate
                </button>
                <button
                  onClick={() => setCurrentView("contact")}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Contact Us
                </button>
              </div>
            </footer>
          </>
        )}
        {currentView === "map" && <MapView onFlagError={handleFlagError} />}
        {currentView === "submit" && <SubmitForm />}
        {currentView === "about" && <AboutSection onNavigate={setCurrentView} />}
        {currentView === "methodology" && <MethodologySection onNavigate={setCurrentView} />}
        {currentView === "donate" && <DonateSection />}
        {currentView === "contact" && (
          <ContactSection
            prefillSubject={flaggedChurch ? "Data Correction" : undefined}
            prefillMessage={
              flaggedChurch
                ? `I'd like to flag an error in the record for: ${flaggedChurch}\n\nPlease describe the correction needed:\n`
                : undefined
            }
            onRendered={() => setFlaggedChurch(null)}
          />
        )}
      </main>
    </>
  )
}
