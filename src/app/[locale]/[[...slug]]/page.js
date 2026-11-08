import Breadcrumbs from "@/components/website/breadcrumbs";
import StructuredData from "@/components/website/structured-data";
import { notFound } from "next/navigation";
import { websitePages, locales } from "@/config/website";
import { getDictionary } from "@/lib/website/dictionaries";
import { getVehicles, getVehicle } from "@/services/website/vehicles.service";
import { websiteMetadata } from "@/lib/website/metadata";
import HomePage from "@/components/website/home-page";
import VehicleList from "@/components/vehicles/vehicle-list";
import { PageIntro } from "@/components/website/ui";
import { AboutPage, SolutionsPage, ServicesPage, PartsPage, FleetPage, ContactPage, VehicleDetailsPage } from "@/components/website/content-pages";

export const dynamicParams = false;
export async function generateStaticParams() {
  return [{ slug: [] }, ...websitePages.map((page) => ({ slug: [page] })), ...(await getVehicles()).map((vehicle) => ({ slug: ["vehicles", vehicle.id] }))];
}
export async function generateMetadata({ params }) {
  const { locale, slug = [] } = await params;
  const vehicle = slug[0] === "vehicles" && slug[1] ? await getVehicle(slug[1]) : null;
  return websiteMetadata(locale, slug[0] || "home", vehicle);
}
async function WebsitePage({ params }) {
  const { locale, slug = [] } = await params;
  const [page = "home", id] = slug;
  if (!locales.includes(locale) || slug.length > 2 || (page !== "home" && !websitePages.includes(page)) || (id && page !== "vehicles")) notFound();
  const dictionary = getDictionary(locale);
  const props = { locale, dictionary };
  if (page === "home") return <HomePage {...props} vehicles={await getVehicles()} />;
  if (page === "vehicles" && id) {
    const vehicle = await getVehicle(id);
    if (!vehicle) notFound();
    return <VehicleDetailsPage {...props} vehicle={vehicle} vehicles={await getVehicles()} />;
  }
  if (page === "vehicles") return <><PageIntro content={dictionary.pages.vehicles} /><VehicleList {...props} vehicles={await getVehicles()} /></>;
  const Pages = { about: AboutPage, solutions: SolutionsPage, services: ServicesPage, "parts-accessories": PartsPage, "fleet-corporate": FleetPage, contact: ContactPage, "service-request": ContactPage, "customer-support": ContactPage };
  const Component = Pages[page];
  return <Component {...props} service={page === "service-request"} support={page === "customer-support"} />;
}

export default async function Page(props) {
  const { locale, slug = [] } = await props.params;
  const vehicle = slug[0] === "vehicles" && slug[1] ? await getVehicle(slug[1]) : undefined;
  return <><StructuredData locale={locale} page={slug[0] || "home"} vehicle={vehicle} /><Breadcrumbs locale={locale} page={slug[0] || "home"} vehicle={vehicle} />{await WebsitePage(props)}</>;
}
