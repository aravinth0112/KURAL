"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageCircle, Mail, Phone, ExternalLink } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/adminnadhan")) return null;

  return (
    <footer className="border-t border-border/60 bg-background pt-16 md:pt-20 pb-28 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center">
        
        {/* Large Wordmark & Brand Introduction */}
        <div className="mb-12 sm:mb-14 flex flex-col items-center text-center gap-3 sm:gap-4">
          <Link href="/" className="inline-flex flex-col items-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="LPU Tamizhans Logo" 
              width={72} 
              height={72} 
              className="object-contain mx-auto"
            />
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
              LPU Tamizhans
            </h2>
          </Link>
          <p className="text-muted-foreground font-medium text-xs sm:text-sm md:text-base tracking-wide max-w-md mx-auto text-center">
            The Tamil Student Community of Lovely Professional University
          </p>
        </div>

        {/* Sitemap Links Grid: 4 Balanced Columns (4 items each) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12 w-full mb-12 text-left">
          {/* Column 1: Community */}
          <div className="space-y-3.5">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Community</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/kural" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  About Kural
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Join Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Moments */}
          <div className="space-y-3.5">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Moments</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/gallery" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Moments Gallery
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Campus Celebrations
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Cultural Highlights
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Photo &amp; Media Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="space-y-3.5">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Connect</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1"
                >
                  <span>WhatsApp Community</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link href="/team#join" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Apply for Core Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  General Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="space-y-3.5">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Legal &amp; Info</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/kural" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium inline-block">
                  Community Constitution
                </Link>
              </li>
              <li>
                <Link href="/adminnadhan" className="text-xs sm:text-sm text-muted-foreground/80 hover:text-primary transition-colors font-medium inline-block">
                  Admin Portal ↗
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Direct Channels Contact Strip */}
        <div className="w-full pt-8 pb-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-muted-foreground font-medium">
            <a 
              href="https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp Group</span>
            </a>
            <a 
              href="mailto:contact.kurallpu@gmail.com" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>contact.kurallpu@gmail.com</span>
            </a>
            <a 
              href="tel:+919360364837" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+91 93603 64837</span>
            </a>
          </div>

          <div className="text-muted-foreground/70 text-xs font-medium text-center sm:text-right shrink-0">
            Phagwara, Punjab 144411
          </div>
        </div>

        {/* Copyright Bar: Crisp Left/Right Baseline Alignment */}
        <div className="w-full pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-[13px] pb-32 sm:pb-8 md:pb-4">
          <p className="font-medium text-center sm:text-left text-muted-foreground">
            <span className="text-foreground font-bold">LPU Tamizhans</span> is our community.{" "}
            <Link href="/kural" className="text-primary font-bold hover:underline">
              Kural
            </Link>{" "}
            is the team behind it.
          </p>
          <p className="text-muted-foreground/60 text-center sm:text-right shrink-0">
            © {new Date().getFullYear()} LPU Tamizhans &amp; Kural. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
