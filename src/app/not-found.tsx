import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center flex flex-col items-center">
        {/* Logo / Emblem */}
        <div className="w-24 h-24 rounded-full bg-secondary/80 border border-border p-4 mb-6 shadow-sm flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="LPU Tamizhans Logo"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>

        {/* Status Pill */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          Error 404 • Page Not Found
        </span>

        {/* Heading */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight mb-3">
          Lost Your Way?
        </h1>

        {/* Tamil Phrase */}
        <p className="font-heading text-xl font-bold text-primary mb-4">
          வழி தவறிவிட்டீர்களா?
        </p>

        {/* Description */}
        <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-md">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable in our community archive.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="rounded-full px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-md text-base h-12">
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-bold border-border hover:bg-secondary text-foreground text-base h-12">
            <Link href="/gallery" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Explore Moments
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
