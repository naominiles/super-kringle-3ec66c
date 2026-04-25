import { DonateButton } from "@/components/donate-button"
import { CreditCard, Landmark } from "lucide-react"

export function DonateSection() {
  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
        Support the Work
      </h1>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Your donation helps us continue documenting the history of attacks on
        Black churches in the South during the Civil Rights era.
      </p>

      <p className="mt-4 leading-relaxed text-muted-foreground">
        The Black Church Burning Project is fiscally sponsored by{" "}
        <a
          href="https://media-alliance.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
        >
          Media Alliance
        </a>
        . All donations are{" "}
        <strong className="text-foreground">tax deductible</strong> and will go
        directly toward furthering the work of the Black Church Burning Project.
      </p>

      <div className="mt-10 border border-border bg-card p-8 flex flex-col items-center gap-6 text-center">
        <p className="font-serif text-lg text-foreground font-medium">
          Donate via PayPal
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Clicking the button below will take you to PayPal&apos;s secure
          donation page. You can give using your PayPal balance, debit card,
          credit card, or Venmo.
        </p>
        <DonateButton />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded border border-border bg-card/50 px-4 py-3">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Debit or credit card</strong>{" "}
            &mdash; available on the PayPal page, no PayPal account required
          </p>
        </div>
        <div className="flex items-start gap-3 rounded border border-border bg-card/50 px-4 py-3">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">PayPal or Venmo</strong>{" "}
            &mdash; log in with your existing account to give quickly
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        Donations are processed securely through PayPal on behalf of Media Alliance,
        a 501(c)(3) nonprofit organization.
      </p>
    </section>
  )
}
