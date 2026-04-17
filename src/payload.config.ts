import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media/config'
import { env } from 'process'
import { Articles } from './collections/Articles/config'
import { ArticleAuthors } from './collections/ArticleAuthors/config'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        autoLogin: {
            email: env.CMS_SEED_ADMIN_EMAIL,
            password: env.CMS_SEED_ADMIN_PASSWORD,
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
    }),
    sharp,

    // inside buildConfig:
    plugins: [
        vercelBlobStorage({
            enabled: true,
            collections: {
                media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN || '',
        }),
    ],
})
