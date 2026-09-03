/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hololive.hololivepro.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/classic", destination: "/classic/daily", permanent: true },
      { source: "/endless-classic", destination: "/classic/endless", permanent: true },
      { source: "/competitive-classic", destination: "/classic/competitive", permanent: true },
      { source: "/avatar", destination: "/avatar/daily", permanent: true },
      { source: "/avatar-endless", destination: "/avatar/endless", permanent: true },
    ];
  },
};

module.exports = nextConfig;
