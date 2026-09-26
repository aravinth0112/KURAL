"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  
  if (pathname.startsWith('/adminnadhan')) return null;

  return (
    <footer className="border-t border-border/60 bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center text-center">
        
        {/* Large Wordmark */}
        <div className="mb-10 sm:mb-12 flex flex-col items-center gap-3 sm:gap-4">
          <Link href="/" className="flex flex-col items-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity">
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
          <p className="text-muted-foreground font-medium text-xs sm:text-sm md:text-base tracking-wide max-w-md">
            The Tamil Student Community of Lovely Professional University
          </p>
        </div>

        {/* Sitemap Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 w-full mb-10 text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3.5">Community</p>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Home</Link></li>
              <li><Link href="/kural" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">About Kural</Link></li>
              <li><Link href="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Our Team</Link></li>
              <li><Link href="/join" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Join Community</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3.5">Moments</p>
            <ul className="space-y-2.5">
              <li><Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Moments Gallery</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3.5">Connect</p>
            <ul className="space-y-2.5">
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Contact Us</Link></li>
              <li><a href="https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">WhatsApp Community</a></li>
              <li><Link href="/team#join" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Apply for Team</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3.5">Legal</p>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        {/* Social / Direct Channels Row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
          <a href="https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5">
            WhatsApp Community
          </a>
          <a href="mailto:contact.kurallpu@gmail.com" className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5">
            contact.kurallpu@gmail.com
          </a>
          <a href="tel:+919360364837" className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5">
            +91 93603 64837
          </a>
        </div>

        {/* Copyright Bar */}
        <div className="text-xs sm:text-sm text-muted-foreground/70 w-full pt-6 sm:pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="font-medium">
            <span className="text-foreground font-bold">LPU Tamizhans</span> is our community.{" "}
            <Link href="/kural" className="text-primary font-bold hover:underline">Kural</Link> is the team behind it.
          </p>
          <p className="text-muted-foreground/60">© {new Date().getFullYear()} LPU Tamizhans &amp; Kural. All rights reserved.</p>
        </div>
        
      </div>
    </footer>
  )
}

