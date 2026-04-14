import { postgresAdapter } from '@payloadcms/db-postgres'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media/config'
import { env } from './lib/env'
import { Articles } from './collections/Articles/config'
import { de } from 'zod/v4/locales'
import { ArticleAuthors } from './collections/ArticlesAuthors/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        autoLogin: {
            email: process.env.CMS_SEED_ADMIN_EMAIL || '',
            password: process.env.CMS_SEED_ADMIN_PASSWORD || '',
        },
    },
    collections: [Users, Media, Articles, ArticleAuthors],
    editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
    }),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        },
        push: true,
    }),
    sharp,
    plugins: [],
})
