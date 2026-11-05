import HomePage from "@/components/website/home-page";
import { getVehicles } from "@/services/website/vehicles.service";
import { getDictionary } from "@/lib/website/dictionaries";
import { websiteMetadata } from "@/lib/website/metadata";

export const metadata = websiteMetadata("en");
export default async function Page() { return <HomePage locale="en" dictionary={getDictionary("en")} vehicles={await getVehicles()} />; }
