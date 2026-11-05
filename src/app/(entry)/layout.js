import DocumentLayout from "@/components/website/document-layout";
import WebsiteShell from "@/components/website/website-shell";
import { getDictionary } from "@/lib/website/dictionaries";

export default function EntryLayout({ children }) {
  return <DocumentLayout locale="en"><WebsiteShell locale="en" dictionary={getDictionary("en")}>{children}</WebsiteShell></DocumentLayout>;
}
