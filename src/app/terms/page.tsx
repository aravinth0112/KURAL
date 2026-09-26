import Link from "next/link";
import { Metadata } from "next";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | LPU Tamizhans & Kural",
  description: "The terms governing your use of the LPU Tamizhans and Kural website — straightforward guidelines for a student community site.",
  alternates: {
    canonical: "https://lputamizhans.com/terms",
  },
  openGraph: {
    title: "Terms of Use | LPU Tamizhans & Kural",
    description: "The terms governing your use of the LPU Tamizhans and Kural website.",
    url: "https://lputamizhans.com/terms",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LPU Tamizhans" }],
    locale: "en_IN",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">

      {/* Header */}
      <div className="mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
          <ScrollText className="w-3.5 h-3.5" />
          Terms of Use
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
          Fair rules for<br />
          <span className="text-primary">a community site.</span>
        </h1>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
          By using this site, you agree to these terms. They&apos;re written to be readable — not intimidating.
        </p>
        <p className="text-xs text-muted-foreground/60 font-medium mt-4">
          Last updated: 25 September 2026
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">

        {/* About this site */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">About this site</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            This is the official website of <strong className="text-foreground">LPU Tamizhans</strong> — the Tamil student community at Lovely Professional University — and <strong className="text-foreground">Kural</strong>, the student organisation that runs it. The site exists to share information about our events, community activities, and the team behind it all, and to make it easier to connect with us.
          </p>
          <p className="text-muted-foreground font-medium leading-relaxed mt-3">
            We are a student-run, non-commercial community. This is not a commercial platform or business service.
          </p>
        </section>

        {/* Accurate information */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Submitting accurate information</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            When you use any form on this site — whether it&apos;s the Contact form, an event registration form, or the team application form — you agree that the information you provide is <strong className="text-foreground">truthful and accurate</strong>. Submitting false, misleading, or someone else&apos;s information is not permitted.
          </p>
        </section>

        {/* Event registration */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Event registrations</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Submitting an event registration form confirms your interest in attending — it does <strong className="text-foreground">not guarantee entry</strong>. Kural reserves the right to manage event capacity and may communicate changes, cancellations, or waitlisting directly to registered participants. We&apos;ll always try to give as much notice as possible.
          </p>
        </section>

        {/* Content ownership */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Content &amp; ownership</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            All text, photography, event visuals, logos, and branding on this site belong to <strong className="text-foreground">LPU Tamizhans and Kural</strong>. You may not reproduce, redistribute, or republish any of this content without our explicit written permission. Sharing a link to the site is always fine — copying and reposting content as your own is not.
          </p>
        </section>

        {/* Acceptable use */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Acceptable use</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">When using this site, you agree not to:</p>
          <ul className="list-disc list-inside space-y-2 pl-1 text-muted-foreground font-medium leading-relaxed mt-3">
            <li>Submit spam, bot-generated, or intentionally false information through any form</li>
            <li>Attempt to access restricted coordinator portals, administrative dashboards, or backend systems without authorization</li>
            <li>Use the site in any way that could harm the community, its members, or LPU Tamizhans&apos; reputation</li>
            <li>Scrape or systematically extract data from the site</li>
          </ul>
        </section>

        {/* Liability */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Liability</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            This site is provided &ldquo;as is&rdquo; by a volunteer student team. While we do our best to keep information accurate and the site running smoothly, Kural and LPU Tamizhans are not liable for any indirect loss, inconvenience, or issues arising from your use of the site. Event details, dates, and logistics are subject to change; always verify with us directly for the latest information.
          </p>
        </section>

        {/* Your data */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Your data</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            For details on what information we collect, how it&apos;s stored, and how to request deletion, see our{" "}
            <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Changes to these terms</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            As the site grows, these terms may be updated. The date at the top of this page will always reflect when they were last revised. Continued use of the site after changes means you accept the updated terms.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Questions</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            If you have questions about these terms, reach out via the{" "}
            <Link href="/contact" className="text-primary font-bold hover:underline">Contact page</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}