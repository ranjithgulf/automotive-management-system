"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/website/dictionaries";
import { pagePath } from "@/config/website";
import { buttonPrimary, Container } from "@/components/website/ui";

export default function NotFound() {
  const { locale = "en" } = useParams();
  const d = getDictionary(locale);
  return <Container className="py-24 text-center"><p className="text-sm font-semibold text-teal-700">404</p><h1 className="mt-4 text-4xl font-semibold">{d.notFound.title}</h1><p className="mt-5 text-sm leading-7 text-slate-500">{d.notFound.text}</p><Link href={pagePath(locale)} className={`${buttonPrimary} mt-7`}>{d.notFound.button}</Link></Container>;
}
