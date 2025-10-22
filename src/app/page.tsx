"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesColumn,
  Cpu,
  FileText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const heroHighlights = [
  "Instant breakdowns for record, brand, and sponsorship deals",
  "Exclusivity, royalty, and deliverable risks flagged automatically",
  "Shareable briefs for managers, reps, and legal partners",
] as const;

const capabilityCards = [
  {
    title: "Rights clarity",
    description:
      "Surface usage rights, exclusivity windows, and territory limits before they block your release or campaign.",
    icon: FileText,
  },
  {
    title: "Payout math",
    description:
      "Translate advances, splits, and performance bonuses into clear cash-flow timelines your team can trust.",
    icon: Workflow,
  },
  {
    title: "Negotiation prep",
    description:
      "Generate creative-friendly prompts that suggest counter language and callouts for counsel consultations.",
    icon: ChartNoAxesColumn,
  },
] as const;

const timeline = [
  {
    phase: "Upload",
    title: "Upload your contract",
    body: "Drop in PDFs from labels, brands, agencies, or venues. We fingerprint the file and get it ready for parsing.",
  },
  {
    phase: "Parse",
    title: "Decode the terms",
    body: "We rebuild the agreement into organized sections so you can skim deliverables, payments, and restrictions in plain language.",
  },
  {
    phase: "Analyze",
    title: "Trigger AI review",
    body: "Send structured text to OpenRouter with curated prompts for artist and creator negotiations, risk analysis, and alternative language suggestions.",
  },
  {
    phase: "Deliver",
    title: "Share the brief",
    body: "Hand managers, agents, and legal partners an actionable summary with risks, follow-ups, and talking points.",
  },
] as const;

const ecosystem = [
  {
    title: "Artists & managers",
    items: [
      "Translate label agreements into plain language",
      "Track deliverables, options, and key deadlines",
      "Prep smarter questions before calling counsel",
    ],
  },
  {
    title: "Influencer marketing",
    items: [
      "Highlight usage rights and exclusivity conflicts",
      "Centralize campaign deliverables and payment triggers",
      "Share briefings with talent leads in seconds",
    ],
  },
  {
    title: "Legal partners",
    items: [
      "Structured exports for counsel-ready markups",
      "Prompt kits for risk reviews and fallback language",
      "Webhook triggers to push notes into your systems",
    ],
  },
] as const;

const pricing = [
  {
    name: "Launch",
    price: "$0",
    description: "Kick off with personal deals, session work, or small brand collaborations.",
    features: [
      "Up to 15 contract analyses monthly",
      "OpenRouter integration with community models",
      "Lightweight workspace with export options",
    ],
  },
  {
    name: "Growth",
    price: "$249",
    description: "Designed for busy creator teams managing weekly releases and campaigns.",
    features: [
      "Unlimited parsing with priority processing",
      "Model presets for Anthropic, OpenAI, and Mistral via OpenRouter",
      "Advanced insights: risk radar, clause clustering, renewal timeline",
      "Team workspaces with shared notes",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For agencies and labels productizing talent support or compliance services.",
    features: [
      "Dedicated ingestion pipelines",
      "Custom prompt kits and guardrails",
      "Private deployments & SSO via Clerk",
      "Priority roadmap influence",
    ],
  },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.3),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.25),_transparent_60%)]" />
        <div className="absolute inset-0 backdrop-blur-[120px]" />
      </div>

      <main className="snap-y snap-mandatory">
        <section className="relative mx-auto grid min-h-[100svh] max-w-6xl snap-start grid-cols-1 items-center gap-12 px-6 pb-24 pt-28 md:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              <Sparkles className="size-4 text-sky-300" />
              Contract analyzer for creators & reps
            </div>

            <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Know every clause before you sign the deal.
            </h1>

            <p className="max-w-xl text-lg text-slate-200/90">
              ContractPPT decodes label, brand, and sponsorship agreements into plain language. Upload a contract,
              get the rights, cash, and risk talking points your team needs to negotiate with confidence.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-purple-500 to-rose-500 px-7 py-6 text-base font-semibold text-white shadow-[0_25px_60px_-15px_rgba(56,189,248,0.45)] transition hover:shadow-[0_30px_60px_-12px_rgba(168,85,247,0.55)]"
              >
                <Link href="/analyze">
                  Launch analyzer
                  <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-6 text-base text-white transition hover:border-white/25 hover:bg-white/10"
              >
                <a href="#features">
                  See capabilities
                  <BadgeCheck className="size-5" />
                </a>
              </Button>
            </div>

            <ul className="grid gap-3 text-sm text-slate-200/80 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <li
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/5/50 px-4 py-3 backdrop-blur"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex h-full items-center justify-center">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-500/30 backdrop-blur">
              <div className="absolute inset-x-10 top-10 h-32 rounded-full bg-gradient-to-r from-sky-400/40 via-purple-500/30 to-rose-500/40 blur-[60px]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.4em] text-slate-200/80">
                  <span>AI Highlights</span>
                  <span className="inline-flex items-center gap-1 text-slate-200/80">
                    <span className="inline-flex size-2 rounded-full bg-sky-300" />
                    Live
                  </span>
                </div>
                <div className="space-y-4 text-sm leading-6 text-slate-100/90">
                  <p>
                    “Termination clause grants 90-day convenience exit. Flag for negotiation if initial term
                    under 12 months.”
                  </p>
                  <p>
                    “Exclusive territory limited to existing customers. No conflict with current partner
                    agreements.”
                  </p>
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.3em] text-sky-200">
                    Generated via OpenRouter · Claude 3.5 Sonnet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto grid min-h-[100svh] max-w-6xl snap-start gap-10 px-6 pb-24 pt-16"
        >
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              Confidence for every deal
            </span>
            <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Built for creators, reps, and counsel working the same contract.
            </h2>
            <p className="text-base text-slate-200/80">
              Whether you are signing a record option, tour sponsorship, or influencer campaign, ContractPPT keeps your
              parsing and AI review loop consistent, auditable, and fast.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {capabilityCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/20 transition hover:border-sky-300/60 hover:shadow-sky-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sky-200">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="relative mt-6 text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-6 text-slate-200/80">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="workflow" className="mx-auto grid min-h-[100svh] max-w-6xl snap-start gap-12 px-6 pb-24 pt-16 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
              Guided workflow
            </span>
            <h2 className="text-4xl font-semibold text-white md:text-5xl">
              From upload to AI insights without leaving the workspace.
            </h2>
            <p className="text-base text-slate-200/80">
              Every stage is deterministic and auditable. Legal ops can review the parsing log, counsel can enrich the
              analysis, and stakeholders see the same dashboard.
            </p>
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="absolute inset-x-0 top-10 bottom-10 -z-10 rounded-full bg-gradient-to-b from-sky-500/10 via-transparent to-purple-500/10 blur-3xl" />
            {timeline.map((item) => (
              <div
                key={item.phase}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/70">
                  {item.phase}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200/80">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="integrations"
          className="mx-auto flex min-h-[100svh] max-w-6xl snap-start flex-col gap-10 px-6 pb-24 pt-16"
        >
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
              Ecosystem
            </span>
            <h2 className="text-4xl font-semibold text-white md:text-5xl">
              Slot ContractPPT into your AI and ops stack.
            </h2>
            <p className="max-w-3xl text-base text-slate-200/80">
              Built around OpenRouter and Clerk, the analyzer plugs into your preferred models, authentication, and
              lightweight storage. Choose a custom database, export to CRMs, or ship straight to revenue dashboards.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ecosystem.map((column) => (
              <div
                key={column.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-500/20"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                  <Cpu className="size-4" />
                  {column.title}
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200/80">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-flex size-1.5 rounded-full bg-gradient-to-br from-sky-400 via-purple-400 to-rose-400" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="mx-auto flex min-h-[100svh] max-w-6xl snap-start flex-col gap-10 px-6 pb-24 pt-16"
        >
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              Pricing
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
              Choose the runway that matches your review volume.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-200/80">
              Start free. Switch tiers as your deal cadence grows. Enterprise plans ship with dedicated ingestion,
              private models, and audit logging.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((tier, index) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg shadow-sky-500/20 transition",
                  index === 1 && "border-sky-400/60 bg-sky-500/10 shadow-sky-500/40"
                )}
              >
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-200/70">
                    {tier.name}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">{tier.price}</p>
                  <p className="mt-2 text-sm text-slate-200/80">{tier.description}</p>
                </div>
                <ul className="space-y-3 text-sm text-slate-100/80">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 size-4 text-sky-200" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex-1" />
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "mt-8 rounded-full border border-white/15 bg-white/10 text-xs uppercase tracking-[0.3em] text-slate-100 transition hover:border-white/30 hover:bg-white/15",
                    index === 1 && "border-white/30 bg-white/20 text-white hover:bg-white/25"
                  )}
                >
                  <Link href="/analyze">Start now</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex min-h-[70svh] max-w-6xl snap-start flex-col items-center gap-8 px-6 pb-24 pt-16 text-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
              Ready when you are
            </p>
            <h2 className="text-4xl font-semibold text-white md:text-5xl">
              Ship cleaner reviews, faster negotiations, and confident outcomes.
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-200/80">
              Plug ContractPPT into your review ritual today and deliver the insights your teams need before the next
              stakeholder meet.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-sky-400 via-purple-500 to-rose-500 px-8 py-6 text-base font-semibold text-white shadow-[0_20px_45px_-15px_rgba(14,165,233,0.55)] transition hover:shadow-[0_25px_45px_-12px_rgba(168,85,247,0.6)]"
            >
              <Link href="/analyze">
                Launch analyzer
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="rounded-full border border-white/15 bg-white/5 px-8 py-6 text-base text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <a href="mailto:hello@contractppt.com">Talk to the team</a>
            </Button>
          </div>
          <div className="text-xs uppercase tracking-[0.4em] text-slate-400/70">
            Lightweight custom database ready · Powered by OpenRouter · Auth via Clerk
          </div>
        </section>
      </main>
    </div>
  );
}
