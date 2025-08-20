/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		esmExternals: true,
	},
	webpack: (config) => {
		config.resolve.extensionAlias = {
			'.js': ['.js', '.ts'],
			'.jsx': ['.jsx', '.tsx'],
		};
		return config;
	},
};

export default nextConfig;