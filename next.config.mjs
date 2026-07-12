/** @type {import('next').NextConfig} */
const nextConfig = {
	// 配信 PC へコピーして `node server.js` で起動できる自己完結ビルドを出力する。
	output: "standalone",
	reactStrictMode: true,
};

export default nextConfig;
