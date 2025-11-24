"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Sparkles, Coins } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen">
      {/* ------------------ HERO ------------------ */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Learn. Play. Earn Rewards.
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Almanac is your micro-learning gamified app with daily lessons,
          optional NFT collectibles, and token rewards — all built for a fun and
          frictionless learning experience.
        </p>
        <Link href="/sign-in">
          <Button size="lg" className="px-6 py-6 text-lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* ------------------ FEATURES ------------------ */}
      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <Sparkles className="h-8 w-8 mb-4 text-indigo-600" />
            <h3 className="font-semibold text-xl mb-2">Daily Learning</h3>
            <p className="text-sm">
              Short, engaging lessons designed to fit your daily rhythm.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <Coins className="h-8 w-8 mb-4 text-yellow-600" />
            <h3 className="font-semibold text-xl mb-2">Earn Tokens</h3>
            <p className="text-sm">
              Complete units, watch optional ads, and earn in-app token rewards.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <ShieldCheck className="h-8 w-8 mb-4 text-green-600" />
            <h3 className="font-semibold text-xl mb-2">NFT Collectibles</h3>
            <p className="text-sm">
              Earn optional Polygon-based NFT collectibles for completing
              special units.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ------------------ CTA SECTION ------------------ */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Free Today</h2>
        <p className="mb-8">
          No credit card required. Create your account and unlock your daily
          learning flow.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="px-6 py-6 text-lg">
            Create Account
          </Button>
        </Link>
      </section>

      {/* ------------------ FOOTER ------------------ */}
      <footer className="border-t py-10 text-center text-sm text-gray-500">
        <p className="mb-2">
          © {new Date().getFullYear()} Almanac by Openmind
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms of Service
          </a>
          <a href="/legal-notice" className="hover:text-white">
            Legal Notice
          </a>
        </div>
      </footer>
    </main>
  );
}
