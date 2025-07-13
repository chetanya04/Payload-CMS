const { withPayload } = require('@payloadcms/next/withPayload')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@payloadcms/next'],
    esmExternals: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Handle CSS files specifically
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    })

    // Ignore CSS files in Node.js environment
    if (isServer) {
      webpackConfig.externals = webpackConfig.externals || []
      webpackConfig.externals.push(/\.css$/)
    }

    return webpackConfig
  },
}

module.exports = withPayload(nextConfig, { devBundleServerPackages: false })