import Icon from "./icon";

export function Notice({ children, error = false }) {
  return <div role={error ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-teal-200 bg-teal-50 text-teal-900"}`}><Icon name={error ? "alert" : "check"} className="mt-0.5 size-4 shrink-0" /><div>{children}</div></div>;
}
