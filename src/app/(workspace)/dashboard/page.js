import DashboardView from "@/components/dashboard/dashboard-view";
export const metadata = { title: "Dashboard | AutoFlow GCC" };
// The demo gate waits for browser storage before mounting workspace content.
export const instant = false;
export default function DashboardPage() { return <DashboardView />; }
