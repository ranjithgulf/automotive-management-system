/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Static public website output for the planned Cloudflare Pages deployment.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
