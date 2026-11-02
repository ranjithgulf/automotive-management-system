// One source for sidebar groups, route generation, breadcrumbs, and search.
const links = (prefix, entries) => entries.map(([slug, label, arabic]) => ({
  slug: prefix ? prefix + "/" + slug : slug,
  label,
  arabic: arabic || label,
}));

export const navigationGroups = [
  { id: "overview", label: "Overview", arabic: "نظرة عامة", icon: "grid", children: links("", [["dashboard","Dashboard","لوحة التحكم"]]) },
  { id: "sales", slug: "sales", label: "Sales", arabic: "المبيعات", icon: "chart", children: links("sales", [
    ["leads", "Leads"], ["opportunities", "Opportunities"], ["pipeline", "Sales Pipeline"], ["test-drives", "Test Drives"], ["quotations", "Quotations"], ["orders", "Sales Orders"], ["deliveries", "Vehicle Deliveries"],
  ]) },
  { id: "vehicle-inventory", slug: "vehicle-inventory", label: "Vehicle Inventory", arabic: "مخزون المركبات", icon: "car", children: links("vehicle-inventory", [
    ["stock", "Vehicle Stock"], ["catalog", "Vehicle Catalog"], ["reservations", "Vehicle Reservations"], ["availability", "Vehicle Availability"],
  ]) },
  { id: "workshop", slug: "workshop", label: "Workshop", arabic: "الورشة", icon: "tool", children: links("workshop", [
    ["appointments", "Service Appointments"], ["reception", "Vehicle Reception"], ["inspections", "Inspections"], ["estimates", "Estimates"], ["job-cards", "Job Cards"], ["technicians", "Technician Board"], ["quality-check", "Quality Check"], ["handover", "Vehicle Handover"], ["service-history", "Service History"],
  ]) },
  { id: "parts-procurement", slug: "parts-procurement", label: "Parts & Procurement", arabic: "القطع والمشتريات", icon: "box", children: links("parts-procurement", [
    ["inventory", "Parts Inventory"], ["requests", "Parts Requests"], ["suppliers", "Suppliers"], ["purchase-requests", "Purchase Requests"], ["purchase-orders", "Purchase Orders"], ["goods-received", "Goods Received"],
  ]) },
  { id: "customers", slug: "customers", label: "Customers", arabic: "العملاء", icon: "users", children: links("customers", [
    ["records", "Customer Records"], ["vehicles", "Customer Vehicles"], ["service-history", "Customer Service History"], ["fleet", "Corporate / Fleet Customers"],
  ]) },
  { id: "contracts-warranty", slug: "contracts-warranty", label: "Contracts & Warranty", arabic: "العقود والضمان", icon: "file", children: links("contracts-warranty", [
    ["contracts", "Contracts"], ["vehicles", "Contract Vehicles"], ["registrations", "Warranty Registrations"], ["claims", "Warranty Claims"], ["renewals", "Contract Renewals"],
  ]) },
  { id: "finance", slug: "finance", label: "Finance", arabic: "المالية", icon: "wallet", children: links("finance", [
    ["invoices", "Invoices"], ["payments", "Payments"], ["receivables", "Receivables"], ["credit-notes", "Credit Notes"],
  ]) },
  { id: "customer-support", slug: "customer-support", label: "Customer Support", arabic: "دعم العملاء", icon: "support", children: links("customer-support", [
    ["tickets", "Support Tickets"], ["enquiries", "Customer Enquiries"],
  ]) },
  { id: "marketing", slug: "marketing", label: "Marketing", arabic: "التسويق", icon: "megaphone", children: links("marketing", [
    ["campaigns", "Campaigns"], ["offers", "Offers"], ["segments", "Customer Segments"],
  ]) },
  { id: "people", label: "People", arabic: "الموارد البشرية", icon: "users", children: [
    ...links("", [["employees","Employees","الموظفون"]]),
    ...links("people", [["attendance", "Attendance"], ["leave", "Leave"], ["payroll", "Payroll"]]),
  ] },
  { id: "reports", slug: "reports", label: "Reports", arabic: "التقارير", icon: "chart", children: links("reports", [
    ["sales", "Sales Reports"], ["workshop", "Workshop Reports"], ["inventory", "Inventory Reports"], ["finance", "Finance Reports"], ["branches", "Branch Performance"],
  ]) },
  { id: "administration", slug: "settings", label: "Administration", arabic: "الإدارة", icon: "settings", children: links("settings", [
    ["users-roles", "Users & Roles"], ["branches", "Branch Settings"], ["workflows", "Workflow Settings"], ["integrations", "Integration Settings"],
  ]) },
];

export const navigation = navigationGroups.flatMap((group) => [
  ...(group.slug ? [{ slug: group.slug, label: group.label, arabic: group.arabic, icon: group.icon, group: group.label }] : []),
  ...group.children.map((item) => ({ ...item, icon: group.icon, group: group.label })),
]);
