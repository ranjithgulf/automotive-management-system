/* eslint-disable @next/next/no-img-element -- Explicit responsive WebP assets support static Cloudflare Pages without an image server. */
import Link from "next/link";
import Icon from "@/components/ui/icon";
import { pagePath } from "@/config/website";

export const buttonPrimary = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-60";
export const buttonSecondary = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-600 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600";
export const websiteInput = "min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-100 sm:text-sm";

export function Container({ children, className = "" }) { return <div className={`mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 ${className}`}>{children}</div>; }
export function Arrow({ className = "size-4" }) { return <Icon name="arrow" className={`${className} shrink-0 rtl:rotate-180`} />; }
export function Eyebrow({ children, light = false }) { return <p className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${light ? "text-teal-300" : "text-teal-700"}`}>{children}</p>; }
export function SectionHeading({ eyebrow, title, text, action }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10"><div className="max-w-2xl"><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-3 whitespace-pre-line text-3xl leading-tight font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>{text && <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{text}</p>}</div>{action}</div>;
}
export function Photo({ name, alt, className = "", priority = false, mobilePortrait = false, sizes = "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 40vw" }) {
  const srcSet = [320, 480, 768, 1024].map((width) => `/images/${name}-${width}.webp ${width}w`).concat(`/images/${name}.webp 1536w`).join(", ");
  const image = <img src={`/images/${name}.webp`} srcSet={srcSet} sizes={sizes} width={1536} height={1024} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={`h-full w-full object-cover ${className}`} />;
  return mobilePortrait ? <picture className="contents"><source media="(max-width: 767px)" srcSet="/images/hero-mobile-480.webp 480w, /images/hero-mobile-640.webp 640w" sizes="100vw" />{image}</picture> : image;
}
export function PageIntro({ content }) {
  return <section className="border-b border-slate-200/70 bg-[#f4f3ee] py-12 sm:py-20"><Container><div className="max-w-3xl"><Eyebrow>{content.eyebrow}</Eyebrow><h1 className="mt-4 whitespace-pre-line text-4xl leading-[1.16] font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{content.title}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">{content.description}</p></div></Container></section>;
}
export function ContactCTA({ locale, dictionary }) {
  const d = dictionary;
  return <section className="bg-teal-950 py-14 text-white sm:py-20"><Container className="flex flex-wrap items-center justify-between gap-8"><div className="max-w-2xl"><Eyebrow light>AutoFlow GCC</Eyebrow><h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{d.home.ctaTitle}</h2><p className="mt-4 text-sm leading-7 text-teal-100/70">{d.home.ctaText}</p></div><Link className="inline-flex min-h-12 items-center gap-4 rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-950 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={pagePath(locale, "contact")}>{d.common.enquiry}<Arrow /></Link></Container></section>;
}
