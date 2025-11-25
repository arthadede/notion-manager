const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  swSrc: "service-worker.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_ACTIVITIES_DATABASE_ID: process.env.NOTION_ACTIVITIES_DATABASE_ID,
    NOTION_TRANSACTIONS_DATABASE_ID: process.env.NOTION_TRANSACTIONS_DATABASE_ID,
  },
};

module.exports = withPWA(nextConfig);
