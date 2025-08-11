/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['images.unsplash.com', 'via.placeholder.com'],
        formats: ['image/webp', 'image/avif'],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
}

module.exports = nextConfig