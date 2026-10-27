"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";

export const plans = [
  {
    name: "Starter",
    description:
      "Modern web design & high-converting landing pages powered by intelligent AI workflows",
    price: 49,
    yearlyPrice: 39,
    buttonText: "Start Starter",
    buttonVariant: "outline" as const,
    features: [
      { text: "Next.js & Tailwind Web App", icon: <Briefcase size={20} /> },
      { text: "AI-assisted Copy & Prompt assets", icon: <Database size={20} /> },
      { text: "Fully responsive multi-device", icon: <Server size={20} /> },
    ],
    includes: [
      "Starter package includes:",
      "Custom UI/UX Design System",
      "Fast Core Web Vitals (99+ score)",
      "Interactive Framer micro-animations",
      "Contact form & Supabase lead capture",
      "Direct developer Slack/Discord channel",
    ],
  },
  {
    name: "Pro Platform",
    description:
      "Multi-platform web applications, SaaS dashboards, and bespoke AI copilot integrations",
    price: 149,
    yearlyPrice: 119,
    buttonText: "Launch with Pro",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      { text: "Multi-platform Web & SaaS", icon: <Briefcase size={20} /> },
      { text: "Custom AI Workflows & LLMs", icon: <Database size={20} /> },
      { text: "Supabase DB, Auth & Vector APIs", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Multi-platform architecture (Web + Admin)",
      "Custom AI agents & prompt workflows",
      "Custom component foundry & UI kit",
      "Continuous weekly feature releases",
      "Priority revisions & code delivery",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Dedicated full-stack engineering & design squad for complex, high-scale web platforms",
    price: 349,
    yearlyPrice: 289,
    buttonText: "Contact Studio",
    buttonVariant: "outline" as const,
    features: [
      { text: "Dedicated Fullstack Squad", icon: <Briefcase size={20} /> },
      { text: "Enterprise Cloud & Edge Architecture", icon: <Database size={20} /> },
      { text: "Custom AI Fine-Tuning & Models", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Pro, plus:",
      "Dedicated Senior Lead Engineer & Designer",
      "Custom design system & microservices",
      "Enterprise SLA & 24/7 priority support",
      "SOC2 / security-first architecture",
      "100% full source code ownership",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-[#141419] border border-white/10 p-1">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-neutral-400 hover:text-white",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border border-orange-500/80 shadow-md shadow-orange-500/30 bg-gradient-to-t from-orange-600 via-orange-500 to-amber-500"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-neutral-400 hover:text-white",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border border-orange-500/80 shadow-md shadow-orange-500/30 bg-gradient-to-t from-orange-600 via-orange-500 to-amber-500"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 text-xs font-semibold">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection5() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="px-4 py-16 max-w-7xl mx-auto relative z-10"
      ref={pricingRef}
    >
      <article className="text-left mb-10 space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Pricing Plans
        </div>

        <h2 className="md:text-5xl text-3xl capitalize font-semibold text-white tracking-tight leading-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            We've got a plan that's perfect for your product
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-base text-sm text-neutral-400 leading-relaxed max-w-xl"
        >
          High-performance web development, modern product design, and AI-powered
          multi-platform solutions. Simple pricing with no surprises.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="pt-2"
        >
          <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit" />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 gap-6 py-4">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative rounded-2xl transition-all duration-300 flex flex-col justify-between h-full",
                plan.popular
                  ? "border border-orange-500/60 bg-gradient-to-b from-[#1b1510] via-[#121217] to-[#0d0d10] shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/30"
                  : "border border-white/10 bg-[#111116]/80 hover:border-white/20 shadow-lg shadow-black/40"
              )}
            >
              <CardHeader className="text-left p-6 sm:p-7">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="xl:text-2xl md:text-xl text-2xl font-bold text-white">
                    {plan.name} Plan
                  </h3>
                  {plan.popular && (
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm shadow-orange-500/30">
                      Most Popular
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 mb-6 min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    $
                    <NumberFlow
                      format={{
                        currency: "USD",
                      }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl sm:text-5xl font-extrabold"
                    />
                  </span>
                  <span className="text-neutral-400 text-sm ml-2 font-medium">
                    /{isYearly ? "month (billed annually)" : "month"}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                  {plan.features.map((feat, fIndex) => (
                    <div
                      key={fIndex}
                      className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300"
                    >
                      <span className="text-orange-400 p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        {feat.icon}
                      </span>
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-7 pt-0 flex flex-col justify-end">
                <Link
                  href="/contact"
                  className={cn(
                    "w-full mb-3 py-3.5 px-4 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 block",
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25 border border-orange-400/40"
                      : plan.buttonVariant === "outline"
                      ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                      : "bg-white text-black hover:bg-neutral-200"
                  )}
                >
                  {plan.buttonText}
                </Link>

                <Link
                  href="/contact"
                  className="w-full mb-6 py-2.5 text-center text-xs sm:text-sm font-medium rounded-xl bg-transparent text-neutral-400 hover:text-white border border-white/5 hover:border-white/15 transition-colors"
                >
                  Talk to an Engineer →
                </Link>

                <div className="space-y-3 pt-5 border-t border-white/[0.08]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2.5">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-xs sm:text-sm">
                        <span className="h-5 w-5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mt-0.5 mr-2.5 flex-shrink-0">
                          <CheckCheck className="h-3 w-3 text-orange-400" />
                        </span>
                        <span className="text-neutral-300 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}

export { PricingSection5 as PricingSection };
