import { Geist, Noto_Sans_Arabic } from "next/font/google";
import "@/app/globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], display: "swap" });

export default function DocumentLayout({ locale, children }) {
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${geist.variable} ${arabic.variable}`}><body className={`min-h-dvh bg-[#fcfcf9] text-slate-900 antialiased ${locale === "ar" ? "font-[family-name:var(--font-arabic)]" : "font-sans"}`}>{children}</body></html>;
}
