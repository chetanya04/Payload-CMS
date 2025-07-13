import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import dotenv from "dotenv"
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Blog from './collections/Blog'
import Workflows from './collections/Workflows'
import WorkflowSteps from './collections/WorkflowSteps'
import WorkflowLogs from './collections/WorkflowLogs'
import DocumentWorkflows from './collections/DocumentWorkflows'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
dotenv.config()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    bundler: 'webpack', // Explicitly set bundler
  },
  collections: [Users, Media, Blog, Workflows, WorkflowSteps, WorkflowLogs, DocumentWorkflows],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '123456789', // Use env variable
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
  ],
})