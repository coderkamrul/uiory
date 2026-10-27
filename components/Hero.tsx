"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Hero built to the provided homepage code: gradient-ring label,
 * Inter 900 headline (56px / 46px leading / -0.03em), radial-gradient
 * word with a blurred twin layer, max-w-md medium paragraph, and the
 * h-14 pale-gradient pill CTA.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-el",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", stagger: 0.09 }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden">
      <header className="flex flex-col items-center px-4 pb-10 pt-[150px] sm:px-6 sm:pt-[164px]">
        <span className="hero-el grad-ring mb-2 inline-flex items-center rounded-full">
          <span className="grad-text px-[8px] py-[3px] text-[10px] font-bold uppercase leading-none">
            Fresh builds every week
          </span>
        </span>

        <h1
          className="hero-el mb-3 text-center text-[38px] font-black uppercase leading-[34px] tracking-[-0.03em] text-[#e5e5e5] sm:text-[48px] sm:leading-[46px] md:text-[56px]"
        >
          <span className="block">
            AI-built <em className="italic">components,</em>
          </span>
          <span className="block">
            shown with{" "}
            <span className="relative inline-block">
              <span className="text-glow-grad">the prompt</span>
              <span aria-hidden className="grad-blur absolute inset-0">
                the prompt
              </span>
            </span>
          </span>
        </h1>

        <p className="hero-el mb-6 max-w-md text-center font-medium text-[#a1a1aa]">
          Real UI components built with AI tools — including the same prompt
          built by two different AIs, side by side. Open any card, copy the
          prompt, rebuild it yourself.
        </p>

        <a
          href="#showcase"
          className="hero-el mb-3 flex h-14 items-center justify-center gap-1 rounded-full border-t-2 border-white px-8 text-lg font-semibold text-[#09090b] transition-opacity hover:opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgb(207, 222, 246) 20%, rgb(250, 250, 250) 80%)",
          }}
        >
          Browse components →
        </a>
      </header>
    </section>
  );
}
