import { vehicles } from "../../lib/mock-data/website.js";

// Canonical public projection. Replace this adapter with an approved server-side
// Zoho source later; do not import business credentials into website components.
export async function getVehicles() { return vehicles.map((vehicle) => ({ ...vehicle, dataSource: "illustrative" })); }
export async function getVehicle(id) { return (await getVehicles()).find((vehicle) => vehicle.id === id) || null; }

export function filterVehicles(items, filters = {}) {
  const query = (filters.search || "").trim().toLowerCase();
  return items.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(query)
    && (!filters.brand || v.brand === filters.brand)
    && (!filters.condition || v.condition === filters.condition)
    && (!filters.type || v.type === filters.type)
    && (!filters.range || (filters.range === "under" ? v.price < 150000 : filters.range === "middle" ? v.price >= 150000 && v.price <= 250000 : v.price > 250000)))
    .sort((a, b) => filters.sort === "low" ? a.price - b.price : filters.sort === "high" ? b.price - a.price : b.listedAt.localeCompare(a.listedAt));
}
