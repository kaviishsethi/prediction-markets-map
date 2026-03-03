/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'pbs.twimg.com', protocol: 'https' },
      { hostname: 'avatars.githubusercontent.com', protocol: 'https' },
      { hostname: 'raw.githubusercontent.com', protocol: 'https' },
      { hostname: 'res.cloudinary.com', protocol: 'https' },
      { hostname: 'lh3.googleusercontent.com', protocol: 'https' },
      { hostname: 'drive.google.com', protocol: 'https' },
      { hostname: 'upload.wikimedia.org', protocol: 'https' },
      // Add more domains as needed
    ],
  },
}

export default nextConfig
