import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@payloadcms/next'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Add CSS handling
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    })

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })