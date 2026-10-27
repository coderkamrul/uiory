import { Check } from "lucide-react";
import type { ShowcaseItem } from "@/lib/data";

/**
 * Card preview. If the admin provided a real preview image/GIF URL it is
 * used as-is. Otherwise we render a REALISTIC miniature of the component
 * — real words, real structure, professional palettes — never abstract
 * placeholder bars.
 */
export default function PreviewArt({
  item,
}: {
  item: Pick<ShowcaseItem, "pattern" | "hue" | "imageUrl" | "mediaUrl" | "mediaType"> & { title?: string };
}) {
  if (item.mediaUrl) {
    if (item.mediaType === "video") {
      return (
        <video
          src={item.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={item.mediaUrl}
        alt={item.title ?? "Component preview"}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  if (item.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={item.imageUrl}
        alt={item.title ?? "Component preview"}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Scene pattern={item.pattern} hue={item.hue} />
    </div>
  );
}

function Scene({ pattern, hue }: { pattern: ShowcaseItem["pattern"]; hue: number }) {
  switch (pattern) {
    case "button":
      return (
        <div className="flex h-full items-center justify-center bg-[#eceef1] p-6">
          <div className="w-[78%] rounded-2xl bg-white p-4 shadow-[0_18px_36px_-18px_rgba(15,23,42,0.35)]">
            <label className="flex items-center gap-2 text-[9.5px] font-medium text-slate-600">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-[4px] bg-blue-600 text-white">
                <Check size={9} strokeWidth={3.5} />
              </span>
              I agree to the Terms &amp; Conditions
            </label>
            <div className="mt-3.5 grid h-11 place-items-center rounded-full bg-gradient-to-b from-[#70abff] to-[#265dd9] text-[13px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(38,93,217,0.7)]">
              Sign up
            </div>
            <p className="mt-3 text-center text-[8.5px] text-slate-400">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className="flex h-full items-center justify-center bg-[#f3f4f2] p-5">
          <div className="flex w-full items-stretch justify-center gap-2">
            {[
              { name: "Starter", price: "$0", feats: ["3 projects", "1 GB storage"], dark: false },
              { name: "Pro", price: "$12", feats: ["Unlimited projects", "Analytics"], dark: true },
              { name: "Team", price: "$29", feats: ["SSO & roles", "Priority support"], dark: false },
            ].map((t) => (
              <div
                key={t.name}
                className={`relative flex-1 rounded-xl p-2.5 ${
                  t.dark
                    ? "bg-slate-900 text-white shadow-[0_16px_28px_-14px_rgba(15,23,42,0.6)]"
                    : "bg-white text-slate-800 shadow-[0_10px_22px_-14px_rgba(15,23,42,0.35)]"
                }`}
              >
                {t.dark && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-1.5 py-[1px] text-[6.5px] font-bold tracking-wide text-slate-900">
                    POPULAR
                  </span>
                )}
                <p className={`text-[8px] font-semibold uppercase tracking-wider ${t.dark ? "text-slate-300" : "text-slate-400"}`}>
                  {t.name}
                </p>
                <p className="mt-1 text-[15px] font-extrabold leading-none">
                  {t.price}
                  <span className={`text-[7.5px] font-medium ${t.dark ? "text-slate-400" : "text-slate-400"}`}> /mo</span>
                </p>
                <ul className={`mt-2 space-y-1 text-[7.5px] leading-tight ${t.dark ? "text-slate-300" : "text-slate-500"}`}>
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <Check size={7} strokeWidth={3} className="text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "nav":
      return (
        <div
          className="flex h-full flex-col p-5"
          style={{ background: `linear-gradient(160deg, hsl(${hue} 45% 16%), hsl(${(hue + 40) % 360} 50% 8%))` }}
        >
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] py-2 pl-3.5 pr-2 backdrop-blur">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white">
              <span className="h-3.5 w-3.5 rounded-[5px] bg-gradient-to-br from-rose-300 to-indigo-400" />
              northwind
            </span>
            <span className="ml-1 hidden gap-2.5 text-[8.5px] text-white/60 sm:flex">
              <span>Product</span><span>Pricing</span><span>Docs</span>
            </span>
            <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[8.5px] font-semibold text-slate-900">
              Sign up
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[17px] font-extrabold leading-[1.12] text-white">
              Ship calmer<br /> software.
            </p>
            <p className="mt-1.5 text-[8.5px] text-white/50">The navbar stays out of the way.</p>
          </div>
        </div>
      );

    case "form":
      return (
        <div className="flex h-full items-center justify-center bg-[#f5f1ea] p-5">
          <div className="w-[74%] rounded-2xl bg-white p-4 shadow-[0_18px_34px_-18px_rgba(60,50,30,0.4)]">
            <p className="text-[12.5px] font-bold text-slate-900">Create your account</p>
            <p className="mt-0.5 text-[8.5px] text-slate-400">Free for 14 days. No card required.</p>
            <p className="mb-1 mt-3 text-[8px] font-semibold text-slate-500">Email</p>
            <div className="rounded-lg border border-slate-200 px-2 py-1.5 text-[8.5px] text-slate-400">you@studio.com</div>
            <p className="mb-1 mt-2 text-[8px] font-semibold text-slate-500">Password</p>
            <div className="rounded-lg border border-slate-200 px-2 py-1.5 text-[8.5px] tracking-[0.2em] text-slate-500">••••••••••</div>
            <div className="mt-3 grid h-8 place-items-center rounded-lg bg-slate-900 text-[10px] font-semibold text-white">
              Create account
            </div>
          </div>
        </div>
      );

    case "footer":
      return (
        <div className="flex h-full flex-col justify-between bg-[#0c0c0e] p-5">
          <div className="flex gap-6 pt-1">
            {[
              ["Product", ["Features", "Pricing", "Changelog"]],
              ["Company", ["About", "Careers", "Press"]],
              ["Legal", ["Privacy", "Terms"]],
            ].map(([h, links]) => (
              <div key={h as string}>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/40">{h}</p>
                <ul className="mt-1.5 space-y-1 text-[8.5px] text-white/65">
                  {(links as string[]).map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[30px] font-black uppercase leading-none tracking-tight text-white/[0.92]">
            Forge&amp;Co
          </p>
        </div>
      );

    case "dashboard":
      return (
        <div className="flex h-full bg-[#101418] p-3.5">
          <div className="flex w-[26%] flex-col gap-1 border-r border-white/[0.07] pr-2.5">
            <p className="flex items-center gap-1.5 pb-1.5 text-[9px] font-bold text-white">
              <span className="h-3 w-3 rounded-[4px] bg-cyan-400" /> pulse
            </p>
            {["Overview", "Revenue", "Customers", "Reports", "Settings"].map((l, i) => (
              <p
                key={l}
                className={`rounded-md px-1.5 py-1 text-[8px] ${i === 0 ? "bg-white/[0.09] font-semibold text-white" : "text-white/45"}`}
              >
                {l}
              </p>
            ))}
          </div>
          <div className="flex flex-1 flex-col pl-3">
            <div className="flex gap-2">
              {[
                ["Revenue", "$48.2k", "+12.4%"],
                ["Active users", "12,847", "+3.1%"],
                ["Churn", "0.9%", "−0.2%"],
              ].map(([l, v, d]) => (
                <div key={l} className="flex-1 rounded-lg bg-white/[0.05] p-2">
                  <p className="text-[7px] uppercase tracking-wider text-white/40">{l}</p>
                  <p className="mt-0.5 text-[12px] font-bold leading-none text-white">{v}</p>
                  <p className="mt-0.5 text-[7px] font-medium text-emerald-400">{d}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-2 flex-1 rounded-lg bg-white/[0.05]">
              <svg viewBox="0 0 100 36" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <polyline points="3,28 22,20 40,23 58,12 76,15 97,6" fill="none" stroke="#22d3ee" strokeWidth="2" />
                <circle cx="58" cy="12" r="2.2" fill="#22d3ee" />
              </svg>
            </div>
          </div>
        </div>
      );

    case "card":
      return (
        <div className="flex h-full items-center justify-center bg-[#f4efe7] p-5">
          <article className="w-[80%] overflow-hidden rounded-2xl bg-white shadow-[0_18px_34px_-18px_rgba(60,50,30,0.45)]">
            <div
              className="h-20"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 62%), hsl(${(hue + 45) % 360} 60% 40%))` }}
            />
            <div className="p-3.5">
              <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-orange-500">Design</p>
              <p className="mt-1 text-[12px] font-bold leading-[1.25] text-slate-900">
                The quiet craft of interface design
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[8px] text-slate-400">
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-rose-400" />
                Mara Voss · 6 min read
              </div>
            </div>
          </article>
        </div>
      );

    default: // hero
      return (
        <div
          className="flex h-full flex-col p-5"
          style={{ background: `linear-gradient(155deg, hsl(${hue} 62% 52%), hsl(${(hue + 40) % 360} 58% 30%) 70%, hsl(${(hue + 70) % 360} 55% 20%))` }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="h-3.5 w-3.5 rounded-[5px] bg-white/90" />
            <span className="text-[10px] font-bold">aurora</span>
            <span className="ml-auto flex items-center gap-2.5 text-[8.5px] text-white/65">
              <span>Work</span><span>Studio</span>
              <span className="rounded-full bg-white px-2 py-[3px] font-semibold text-slate-900">Start a project</span>
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[19px] font-extrabold leading-[1.08] text-white">
              Design beyond<br />the obvious.
            </p>
            <p className="mt-1.5 max-w-[190px] text-[8.5px] leading-relaxed text-white/60">
              A brand studio for teams who refuse to blend in.
            </p>
            <span className="mt-3 rounded-full bg-slate-950/70 px-3 py-1.5 text-[8.5px] font-semibold text-white">
              See our work
            </span>
          </div>
        </div>
      );
  }
}
