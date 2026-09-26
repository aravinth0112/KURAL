"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Kural", href: "/kural" },
  { name: "Moments", href: "/gallery" },
  { name: "Team", href: "/team" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname.startsWith('/adminnadhan')) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="w-full max-w-3xl bg-white rounded-full shadow-md border border-border/50 px-2 pointer-events-auto">
        <div className="flex h-[72px] items-center justify-between">
          
          <div className="flex items-center gap-6 pl-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <Image 
                src="/logo.png" 
                alt="LPU Tamizhans Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
              <span className="font-heading font-extrabold text-xl tracking-tight hidden sm:block text-foreground">
                LPU Tamizhans
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors rounded-lg px-2 py-1",
                  pathname === link.href
                    ? "text-brand-orange font-bold"
                    : "text-[#1A1A1A] hover:text-brand-orange font-medium"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center pr-2">
            <Button asChild className="rounded-full px-6 font-bold bg-brand-orange hover:bg-brand-orange/90 text-white shadow-sm h-10 text-sm">
              <Link href="/join">Join Us</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-xl border overflow-hidden pointer-events-auto"
          >
            <div className="px-6 py-6 flex flex-col space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-lg font-semibold transition-colors hover:text-primary p-3 rounded-xl",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2">
                <Button className="w-full rounded-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white" asChild>
                  <Link href="/join">Join Us</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
