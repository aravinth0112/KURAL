import { Metadata } from "next";
import Script from "next/script";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Kural LPU | LPU Tamizhans — Tamil Student Community at LPU",
  description: "Contact Kural LPU — the student organization behind LPU Tamizhans connecting Tamil students LPU Punjab at Lovely Professional University. Reach us for event collaborations, Tamil club inquiries, or to join the team.",
  alternates: {
    canonical: "https://lputamizhans.com/contact",
  },
  openGraph: {
    title: "Contact Kural | LPU Tamizhans",
    description: "Reach out to Kural — the Tamil student club at LPU — for events, collaborations, or team inquiries.",
    url: "https://lputamizhans.com/contact",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact LPU Tamizhans & Kural" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Kural | LPU Tamizhans",
    description: "Reach out to Kural — the Tamil student club at LPU — for events, collaborations, or team inquiries.",
    images: ["/og-image.png"],
  },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact LPU Tamizhans & Kural",
  url: "https://lputamizhans.com/contact",
  description: "Contact page for Kural, the Tamil student organization at Lovely Professional University (LPU), Phagwara, Punjab.",
  mainEntity: {
    "@type": "Organization",
    "@id": "https://lputamizhans.com/#organization",
    name: "Kural — LPU Tamizhans",
    email: "contact.kurallpu@gmail.com",
    telephone: "+91-93603-64837",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Phagwara - Jalandhar Road",
      addressLocality: "Phagwara",
      addressRegion: "Punjab",
      postalCode: "144411",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/lpu.tamizhans",
    ],
  },
};


export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <div className="text-center mb-16">
        <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
          Get in Touch.
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Have a question, want to collaborate, or looking to join the Kural core team? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        
        {/* Contact Info */}
        <div className="space-y-8 bg-secondary p-8 md:p-12 rounded-[2.5rem] border border-border">
          <h2 className="font-heading text-3xl font-bold mb-8 text-foreground">Contact Details</h2>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Phone</p>
              <a href="tel:+919360364837" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                +91 93603 64837
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Email</p>
              <a href="mailto:contact.kurallpu@gmail.com" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                contact.kurallpu@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Instagram</p>
              <a href="https://www.instagram.com/lpu.tamizhans?stkn=MXV5NWlyMG5kb2o4ag==" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                @lpu.tamizhans
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground mb-1">Location</p>
              <p className="text-muted-foreground font-medium mb-3">
                Lovely Professional University<br />
                Phagwara, Punjab, India
              </p>
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-border shadow-inner relative bg-muted">
                <iframe
                  title="Lovely Professional University Campus Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.7263991206124!2d75.7027581765039!3d31.25599206016335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5f5e9c489cf3%3A0x4049a5409d53c300!2sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
              <a
                href="https://maps.google.com/?q=Lovely+Professional+University+Phagwara+Punjab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mt-2.5"
              >
                <span>View Campus on Google Maps</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form with Inline Validation */}
        <ContactForm />

      </div>
    </div>
  );
}

