import test from "node:test";
import assert from "node:assert/strict";
import { navigation, navigationGroups } from "../src/config/navigation.js";

const blueprint = {
  Overview: ["Dashboard"],
  Sales: ["Leads", "Opportunities", "Sales Pipeline", "Test Drives", "Quotations", "Sales Orders", "Vehicle Deliveries"],
  "Vehicle Inventory": ["Vehicle Stock", "Vehicle Catalog", "Vehicle Reservations", "Vehicle Availability"],
  Workshop: ["Service Appointments", "Vehicle Reception", "Inspections", "Estimates", "Job Cards", "Technician Board", "Quality Check", "Vehicle Handover", "Service History"],
  "Parts & Procurement": ["Parts Inventory", "Parts Requests", "Suppliers", "Purchase Requests", "Purchase Orders", "Goods Received"],
  Customers: ["Customer Records", "Customer Vehicles", "Customer Service History", "Corporate / Fleet Customers"],
  "Contracts & Warranty": ["Contracts", "Contract Vehicles", "Warranty Registrations", "Warranty Claims", "Contract Renewals"],
  Finance: ["Invoices", "Payments", "Receivables", "Credit Notes"],
  "Customer Support": ["Support Tickets", "Customer Enquiries"],
  Marketing: ["Campaigns", "Offers", "Customer Segments"],
  People: ["Employees", "Attendance", "Leave", "Payroll"],
  Reports: ["Sales Reports", "Workshop Reports", "Inventory Reports", "Finance Reports", "Branch Performance"],
  Administration: ["Users & Roles", "Branch Settings", "Workflow Settings", "Integration Settings"],
};

test("sidebar covers the entire project blueprint in the requested order", () => {
  assert.deepEqual(Object.fromEntries(navigationGroups.map((group) => [group.label, group.children.map((item) => item.label)])), blueprint);
});

test("navigation has unique destinations and labels, with valid path segments", () => {
  assert.equal(new Set(navigation.map((item) => item.slug)).size, navigation.length);
  assert.equal(new Set(navigation.map((item) => item.label)).size, navigation.length);
  for (const item of navigation) assert.match(item.slug, /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/);
});

test("Arabic primary labels retain their Unicode text", () => {
  for (const group of navigationGroups) {
    assert.match(group.arabic, /\p{Script=Arabic}/u);
    assert.doesNotMatch(group.arabic, /\?/);
  }
  for (const slug of ["dashboard", "employees"]) {
    assert.match(navigation.find((item) => item.slug === slug).arabic, /\p{Script=Arabic}/u);
  }
});

test("previous destinations remain available without duplicate Dashboard or Employees links", () => {
  const previous = ["dashboard", "sales", "vehicle-inventory", "workshop", "parts-procurement", "customers", "contracts-warranty", "finance", "customer-support", "marketing", "employees", "reports", "settings"];
  for (const slug of previous) assert.equal(navigation.filter((item) => item.slug === slug).length, 1);
});
