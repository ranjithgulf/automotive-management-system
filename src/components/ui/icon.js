const paths = {
  grid: ["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
  car: ["m5 7 2-4h10l2 4M3 8h18v10H3zM6 18v3m12-3v3M6 12h2m8 0h2"],
  chart: ["M3 3v18h18M7 15l4-5 4 2 6-7"],
  tool: ["m14 6 4 4 4-4a7 7 0 0 1-9 9l-6 6-4-4 6-6a7 7 0 0 1 9-9z"],
  box: ["m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-4", "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0"],
  file: ["M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h6"],
  wallet: ["M20 8H4V4h15v4M3 8h18v13H3zM16 12h5v5h-5z"],
  support: ["M3 13v-2a9 9 0 0 1 18 0v2M3 12h4v7H3zM17 12h4v7h-4zM19 19v3h-7"],
  megaphone: ["m3 9 17-5v16L3 15zM6 16l2 6h4l-2-5M23 9v6"],
  settings: ["M9 3h6l1 4 4 1v6l-4 2-1 5H9l-1-5-5-2V8l5-1z", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"],
  search: ["m21 21-5-5", "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"],
  chevron: ["m8 10 4 4 4-4"],
  arrow: ["M4 12h16m-6-6 6 6-6 6"],
  up: ["m5 16 6-6 4 4 5-8M15 6h5v5"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"],
  eyeOff: ["m3 3 18 18M9 5c7-2 13 7 13 7l-3 4M6 6c-3 2-4 6-4 6s4 7 10 7c2 0 4-1 5-2M10 10l4 4"],
  lock: ["M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4"],
  mail: ["M3 5h18v14H3zM3 5l9 7 9-7"],
  check: ["m5 12 4 4L19 6"],
  close: ["m6 6 12 12M6 18 18 6"],
  menu: ["M3 6h18M3 12h18M3 18h18"],
  clock: ["M12 7v5l3 2", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"],
  pin: ["M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 0 1 14 0", "M14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0"],
  logout: ["M9 4H3v16h6M9 12h12m-5-5 5 5-5 5"],
  globe: ["M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"],
  alert: ["m12 3 10 18H2zM12 9v5m0 3h.01"],
};

export default function Icon({ name, className = "size-5", ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>{(paths[name] || paths.grid).map((d, i) => <path key={i} d={d} />)}</svg>;
}
