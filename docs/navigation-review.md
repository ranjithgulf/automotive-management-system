# Sidebar blueprint review

## Previously available

Headings: Workspace, Management.

Links: Dashboard, Sales, Vehicle Inventory, Workshop, Parts & Procurement, Customers, Contracts & Warranty, Finance, Customer Support, Marketing, Employees, Reports, Settings.

No child navigation was present.

## Blueprint sections and additions

| Section | Newly added links |
| --- | --- |
| Overview | Existing Dashboard reused |
| Sales | Leads, Opportunities, Sales Pipeline, Test Drives, Quotations, Sales Orders, Vehicle Deliveries |
| Vehicle Inventory | Vehicle Stock, Vehicle Catalog, Vehicle Reservations, Vehicle Availability |
| Workshop | Service Appointments, Vehicle Reception, Inspections, Estimates, Job Cards, Technician Board, Quality Check, Vehicle Handover, Service History |
| Parts & Procurement | Parts Inventory, Parts Requests, Suppliers, Purchase Requests, Purchase Orders, Goods Received |
| Customers | Customer Records, Customer Vehicles, Customer Service History, Corporate / Fleet Customers |
| Contracts & Warranty | Contracts, Contract Vehicles, Warranty Registrations, Warranty Claims, Contract Renewals |
| Finance | Invoices, Payments, Receivables, Credit Notes |
| Customer Support | Support Tickets, Customer Enquiries |
| Marketing | Campaigns, Offers, Customer Segments |
| People | Attendance, Leave, Payroll |
| Reports | Sales Reports, Workshop Reports, Inventory Reports, Finance Reports, Branch Performance |
| Administration | Users & Roles, Branch Settings, Workflow Settings, Integration Settings |

People now contains the existing Employees link plus Attendance, Leave, and Payroll. Overview contains the existing Dashboard link. The Settings heading is now Administration and retains /settings. Existing module overview routes remain linked from their section headings.

The two broad Workspace and Management labels were replaced with the thirteen blueprint sections. No requested blueprint item was left out. Business functionality, actual account permissions, and Zoho integration remain intentionally unimplemented.

Counts: 13 sections, 58 leaf links, 11 retained module overview links, 69 unique destinations. All paths and destination labels are unique in the shared navigation configuration.

The active section expands automatically on navigation. Each section has a keyboard-accessible toggle. Mobile and tablet use the existing drawer; laptops and desktops use the full sidebar. The navigation area scrolls independently, including when several sections are expanded.

## Verification

All 69 destinations were checked over HTTP and rendered their intended dashboard or placeholder response. Browser checks verified active nested links, automatic section expansion, tablet drawer navigation, and independent scrolling with all groups expanded. Forms and dashboard were checked at 320, 375, 640, 768, 1024, 1280, 1536, and 1920 pixels, including dropdowns, dialogs, navigation, and RTL. No page-level horizontal overflow or uncaught browser exception was found.
