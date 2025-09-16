/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	distDir: '../../dist/landing',
	experimental: {
		externalDir: true,
	},
};
export default nextConfig;