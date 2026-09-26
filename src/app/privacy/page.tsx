import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | LPU Tamizhans & Kural",
  description: "How LPU Tamizhans and Kural collect, store, and use information submitted through this website — written plainly, no legal jargon.",
  alternates: {
    canonical: "https://lputamizhans.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | LPU Tamizhans & Kural",
    description: "How LPU Tamizhans and Kural collect, store, and use information submitted through this website.",
    url: "https://lputamizhans.com/privacy",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LPU Tamizhans" }],
    locale: "en_IN",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">

      {/* Header */}
      <div className="mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Privacy Policy
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
          Your data,<br />
          <span className="text-primary">handled honestly.</span>
        </h1>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
          LPU Tamizhans and Kural are a student community — not a company. We collect only what we need, store it securely, and never sell or share it with anyone.
        </p>
        <p className="text-xs text-muted-foreground/60 font-medium mt-4">
          Last updated: 25 September 2026 &nbsp;·&nbsp; This policy may be updated as the site evolves.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">

        {/* What we collect */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">What we collect</h2>
          <div className="space-y-3 text-muted-foreground font-medium leading-relaxed">
            <p>
              We only collect information that you actively provide to us through forms on this site:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <strong className="text-foreground">Contact form</strong> — your name, email address, and the message you write. Nothing else.
              </li>
              <li>
                <strong className="text-foreground">Event registration forms</strong> — your name, email, and any event-specific details (e.g. dietary preference, registration number) required to process your registration.
              </li>
              <li>
                <strong className="text-foreground">Team application form</strong> — your name, email, phone number (optional), department, batch, and the area you want to contribute to.
              </li>
            </ul>
            <p className="mt-3">
              The <Link href="/join" className="text-primary font-bold hover:underline">/join page</Link> contains only outbound links to our WhatsApp group and Instagram page. No data is collected or stored by us when you click those links — they take you directly to WhatsApp and Instagram, which have their own privacy policies.
            </p>
          </div>
        </section>

        {/* How it's stored */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">How it&apos;s stored</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            All submitted data is stored in a secure, encrypted database protected by strict access controls. Submissions are never publicly accessible and can only be reviewed by authorized Kural student coordinators. We never store personal information in public spreadsheets or share it with third parties.
          </p>
        </section>

        {/* How it's used */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">How it&apos;s used</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            The information you submit is used solely to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-1 text-muted-foreground font-medium leading-relaxed mt-3">
            <li>Respond to your inquiry or message</li>
            <li>Manage your event registration and communicate relevant updates</li>
            <li>Follow up on team applications if you expressed interest in joining Kural</li>
          </ul>
          <p className="text-muted-foreground font-medium leading-relaxed mt-3">
            We do <strong className="text-foreground">not</strong> sell your information, share it with third parties, or use it for advertising or marketing purposes.
          </p>
        </section>

        {/* Cookies & tracking */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Cookies &amp; tracking</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            This site does <strong className="text-foreground">not</strong> currently use tracking cookies, advertising cookies, or third-party analytics (e.g. Google Analytics). No behavioural data about your visit is recorded or sent to any external service.
          </p>
        </section>

        {/* Retention & deletion */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Data retention &amp; deletion</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            We retain submitted information only for as long as it is relevant to its purpose (e.g. for the duration of an event cycle, or until an inquiry is resolved). If you would like your submitted data to be deleted, simply reach out to us through the{" "}
            <Link href="/contact" className="text-primary font-bold hover:underline">Contact page</Link> and we will remove it promptly.
          </p>
        </section>

        {/* Questions */}
        <section>
          <h2 className="font-heading text-2xl font-extrabold text-foreground mb-3">Questions about privacy</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            If you have any questions, concerns, or requests related to your data, contact us through the{" "}
            <Link href="/contact" className="text-primary font-bold hover:underline">Contact page</Link>. We&apos;re a small student team and we will respond as promptly as we can.
          </p>
        </section>

      </div>
    </div>
  );
}