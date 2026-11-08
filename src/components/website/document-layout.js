import { Geist, Noto_Sans_Arabic } from "next/font/google";
import "@/app/globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
// Arabic faces load when Arabic text uses them; avoid preloading 166 KB on English pages.
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], display: "swap", preload: false });

export default function DocumentLayout({ locale, children }) {
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${geist.variable} ${arabic.variable}`}><body className={`min-h-dvh bg-[#fcfcf9] text-slate-900 antialiased ${locale === "ar" ? "font-[family-name:var(--font-arabic)]" : "font-sans"}`}>{children}</body></html>;
}
