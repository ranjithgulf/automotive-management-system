import Header from "./header";
import Footer from "./footer";
import SalesIQWidget from "@/components/integrations/salesiq-widget";

export default function WebsiteShell({ locale, dictionary, children }) {
  return <><a href="#main-content" className="fixed start-4 top-2 z-50 -translate-y-24 rounded-full bg-teal-800 px-5 py-3 text-sm text-white focus:translate-y-0">{dictionary.common.skip}</a><Header locale={locale} dictionary={dictionary} /><main id="main-content" tabIndex={-1} className="min-w-0 outline-none">{children}</main><Footer locale={locale} dictionary={dictionary} /><SalesIQWidget locale={locale} dictionary={dictionary} /></>;
}
