// Fictional October 2026 snapshots. Replace through a service when APIs are ready.
export const branches = [
  { id: "dubai", name: "Dubai · Sheikh Zayed", city: "Dubai", revenue: 842000, previousRevenue: 746000, leads: 64, jobs: 38, overdue: 48300, sold: 21, target: 900000, pipeline: [28, 17, 11, 5, 3], workshop: [8, 16, 9, 5] },
  { id: "abudhabi", name: "Abu Dhabi · Mussafah", city: "Abu Dhabi", revenue: 615000, previousRevenue: 548000, leads: 47, jobs: 29, overdue: 32400, sold: 16, target: 700000, pipeline: [20, 13, 8, 4, 2], workshop: [6, 12, 7, 4] },
  { id: "sharjah", name: "Sharjah · Industrial Area", city: "Sharjah", revenue: 387000, previousRevenue: 346000, leads: 31, jobs: 19, overdue: 21700, sold: 11, target: 450000, pipeline: [14, 8, 5, 3, 1], workshop: [4, 8, 4, 3] },
];
export const pipelineStages = ["New leads", "Qualified", "Test drive", "Proposal", "Negotiation"];
export const workshopStages = [
  { label: "Scheduled", color: "text-slate-300", dot: "bg-slate-300" },
  { label: "In progress", color: "text-teal-600", dot: "bg-teal-600" },
  { label: "Awaiting parts", color: "text-amber-400", dot: "bg-amber-400" },
  { label: "Ready for delivery", color: "text-blue-500", dot: "bg-blue-500" },
];
export const inventoryAlerts = [
  { id: "INV-041", branch: "dubai", title: "Toyota Land Cruiser GXR", detail: "2 vehicles left · reorder level 4", tone: "rose", badge: "Low stock", type: "car" },
  { id: "INV-042", branch: "abudhabi", title: "Synthetic engine oil · 5W-30", detail: "8 units left · reorder level 20", tone: "amber", badge: "Reorder", type: "box" },
  { id: "INV-043", branch: "sharjah", title: "Nissan Patrol · 2025", detail: "3 vehicles in stock for over 90 days", tone: "amber", badge: "Aging stock", type: "car" },
];
export const approvals = [
  { id: "APR-1082", branch: "dubai", title: "Vehicle discount request", detail: "Toyota Camry · Sales team", amount: 4500, requestedBy: "Omar Hassan", note: "Proposed discount for a returning fleet customer. Supporting quote will be reviewed in the future Sales module." },
  { id: "APR-1081", branch: "abudhabi", title: "Parts purchase order", detail: "Brake assemblies · Workshop", amount: 12800, requestedBy: "Sara Ahmed", note: "Replacement brake assemblies for scheduled service jobs. Supplier and purchase details are sample values." },
  { id: "APR-1080", branch: "sharjah", title: "Warranty repair estimate", detail: "Nissan X-Trail · Service team", amount: 2350, requestedBy: "Faisal Ali", note: "Estimated service cost awaiting a future warranty review workflow. No approval action is available in this prototype." },
];
export const activities = [
  { id: "ACT-01", branch: "dubai", icon: "car", title: "Vehicle delivered", description: "Toyota Land Cruiser · SO-2026-0842", time: "10 min ago", tone: "teal" },
  { id: "ACT-02", branch: "abudhabi", icon: "tool", title: "Workshop job completed", description: "Major service · WO-2026-1208", time: "25 min ago", tone: "blue" },
  { id: "ACT-03", branch: "sharjah", icon: "users", title: "New fleet inquiry received", description: "Al Noor Logistics · 6 commercial vehicles", time: "42 min ago", tone: "amber" },
  { id: "ACT-04", branch: "dubai", icon: "wallet", title: "Customer payment recorded", description: "AED 24,500 · INV-2026-0651", time: "1 hour ago", tone: "teal" },
];
export const notifications = [
  { id: "N1", title: "3 requests awaiting review", detail: "Discount, purchase order and warranty previews", href: "/dashboard#approvals" },
  { id: "N2", title: "Inventory needs attention", detail: "Low stock and aging vehicles across branches", href: "/dashboard#inventory" },
  { id: "N3", title: "October snapshot is ready", detail: "Your sample branch performance overview", href: "/dashboard#branches" },
];
