# Payload CMS + Next.js — Full Tutorial Documentation

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Seeding](#2-database-seeding)
3. [Environment Variables & Type Safety](#3-environment-variables--type-safety)
4. [Auto Login & Admin Config](#4-auto-login--admin-config)
5. [Building Collections](#5-building-collections)
6. [Media Collection & Blur Hashing](#6-media-collection--blur-hashing)
7. [Seeders — Article Authors & Articles](#7-seeders--article-authors--articles)
8. [Building the Frontend](#8-building-the-frontend)
9. [Deployment](#9-deployment)

---

## 1. Project Setup

### Create the Payload App

```bash
npx create-payload-app
```

- **Project name:** `payload-next-blog`
- **Template:** `blank`
- **Database:** `PostgreSQL`

The default connection string will be:

```
postgres://postgres:<password>@127.0.0.1:5432/payload-next-blog
```

Modify it with your own credentials:

```
postgres://username:password@127.0.0.1:5432/payload_next_blog
```

Verify the database exists:

```bash
psql -U postgres -c "CREATE DATABASE payload_next_blog"
```

> **⚠️ Error — psql Not Found on PATH (Windows)**
> **Symptom:** `psql command not found` when running any psql command.
> **Cause:** PostgreSQL was installed but its `bin` folder was not added to the system PATH.
> **Fix:** Add `C:\Program Files\PostgreSQL\18\bin` to your System PATH environment variable.

---

### Open in VS Code & Push to GitHub

```bash
code -r payload-next-blog

git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/payload-next-blog.git
git push -u origin main
```

> **⚠️ Error — Git Push Rejected**
> **Symptom:** `Updates were rejected because the tip of your current branch is behind`
> **Cause:** Local branch diverged from remote.
> **Fix:** `git push --force`

> **⚠️ Error — Git Rebase Merge Conflict**
> **Symptom:** Merge conflict in `package.json` and `package-lock.json` during rebase.
> **Cause:** Both local and remote had changes to the same files.
> **Fix:** Run `git rebase --abort` then `git push --force`

---

### Configure Prettier

Add `"tabWidth": 4` to `.prettierrc.json`.

Add the format script to `package.json`:

```json
"format": "prettier . --write"
```

Create `.prettierignore` and add:

```
**/payload-types.ts
.tmp
**/.git
**/.hg
**/.pnp.*
**/.svn
**/.yarn/**
**/build
**/dist/**
**/node_modules
**/temp
**/docs/**
tsconfig.json
**/(payload)
```

Run:

```bash
npm run format
```

Commit: `chore: configure prettier`

---

### Clean Up Default Files

In `src/app`:

- Delete the `my-route` folder
- In `(frontend)`, remove `import './styles.css'` from `layout.tsx`
- Delete `styles.css`
- Replace the contents of `page.tsx` with:

```tsx
export default async function HomePage() {
  return null
}
```

Commit: `chore: clean-up`

---

### Run the Server

```bash
npm run server
```

Navigate to `localhost:3000/admin`. If no user exists, you'll be redirected to `/admin/create-first-user`.

---

## 2. Database Seeding

### Folder Structure

In `src`, create:

```
scripts/
  seed/
    seeders/
      admin.seeder.ts
    lib/
      is-duplicate-error.ts
    script.ts
```

---

### `admin.seeder.ts`

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isDuplicateError } from '../lib/is-duplicate-error'
import { env } from '@/lib/env'

export async function seedAdmin() {
  const payload = await getPayload({ config })
  try {
    const response = await payload.create({
      collection: 'users',
      data: {
        email: env.CMS_SEED_ADMIN_EMAIL,
        password: env.CMS_SEED_ADMIN_PASSWORD,
      },
    })
    console.log('Admin user created:', response)
  } catch (error) {
    if (isDuplicateError(error, 'email')) {
      console.log('Admin user already exists')
    } else {
      console.error('Error seeding admin user:', JSON.stringify(error, null, 2))
    }
  }
}
```

---

### `script.ts`

```ts
import { getPayloadClient } from '@/lib/payload/client'
import { seedAdmin } from './seeders/admin.seeder'

async function main() {
  const payload = await getPayloadClient()
  try {
    await seedAdmin(payload)
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

void main()
```

> `0` = success, `1` = error

---

### `package.json` Seed Script

```json
"seed": "tsx -r dotenv/config src/scripts/seed/script.ts"
```

> **⚠️ Error — Missing PAYLOAD_SECRET**
> **Symptom:** Seed fails with a missing secret key error.
> **Cause:** The seed script wasn't loading `.env` via dotenv.
> **Fix:** Add `-r dotenv/config` to the seed script as shown above.

> **⚠️ Error — Missing Space in seed script**
> **Symptom:** `Package subpath './configsrc/scripts/seed/scripts.ts' is not defined`
> **Cause:** Missing space — `dotenv/configsrc/...` instead of `dotenv/config src/...`
> **Fix:** Ensure there is a space: `tsx -r dotenv/config src/scripts/seed/script.ts`

Run the seed:

```bash
npm run seed
```

> **⚠️ Error — Missing Environment Variables**
> **Symptom:** `CMS_SEED_ADMIN_EMAIL and CMS_SEED_ADMIN_PASSWORD undefined`
> **Cause:** Variables not added to `.env`.
> **Fix:** Add both variables to `.env` (see Section 3).

> **⚠️ Error — Empty Email Value**
> **Symptom:** Same validation error even after adding variables.
> **Cause:** `CMS_SEED_ADMIN_EMAIL=` had nothing after the `=` sign.
> **Fix:** Set an actual value: `CMS_SEED_ADMIN_EMAIL=admin@example.com`

> **⚠️ Error — Seed Script Ran Silently With No Output**
> **Cause 1:** Wrong env import — `import { env } from 'process'` instead of `import { env } from '@/lib/env'`, causing `CMS_SEED_ADMIN_EMAIL` to be undefined.
> **Cause 2:** `seedAdmin` was referenced but not called (missing parentheses).
> **Fix:** Change import to `@/lib/env` and call `await seedAdmin()`

---

### Duplicate Error Handling

Install Zod:

```bash
npm install zod
```

> **⚠️ Error — Zod Version Conflict**
> **Symptom:** `The requested module 'zod' does not provide an export named 'z'`
> **Cause:** The seed script was written for Zod v3, but the project had Zod v4 installed.
> **Fix:** Uninstall and reinstall Zod, or remove Zod from the seed file entirely and replace with plain TypeScript type checking.

Create `src/scripts/seed/lib/is-duplicate-error.ts`:

```ts
import { z } from 'zod'

const payloadErrorSchema = z.object({
  name: z.string(),
  status: z.number(),
  data: z.object({
    collection: z.string(),
    errors: z.array(
      z.object({
        message: z.string(),
        path: z.string(),
      }),
    ),
  }),
})

type PayloadErrorLike = z.infer<typeof payloadErrorSchema>

function isPayloadError(error: unknown): error is PayloadErrorLike {
  return payloadErrorSchema.safeParse(error).success
}

export function isDuplicateError(error: unknown, field: string): boolean {
  return (
    isPayloadError(error) &&
    error.data.errors?.some(
      (err) => err.path === field && /already registered/i.test(err.message),
    ) === true
  )
}
```

---

## 3. Environment Variables & Type Safety

Add to `.env` and `.env.example`:

```env
CMS_SEED_ADMIN_EMAIL=admin@example.com
CMS_SEED_ADMIN_PASSWORD=password
```

Install the T3 env package:

```bash
npm install @t3-oss/env-nextjs zod
```

Create `src/lib/env.ts`:

```ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    CMS_SEED_ADMIN_EMAIL: z.email(),
    CMS_SEED_ADMIN_PASSWORD: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    CMS_SEED_ADMIN_EMAIL: process.env.CMS_SEED_ADMIN_EMAIL,
    CMS_SEED_ADMIN_PASSWORD: process.env.CMS_SEED_ADMIN_PASSWORD,
  },
})
```

> **⚠️ Error — Wrong Variable Names in `env.ts`**
> **Symptom:** Seed still failing validation after adding variables.
> **Cause:** `runtimeEnv` was using `process.env.ADMIN_EMAIL` instead of `process.env.CMS_SEED_ADMIN_EMAIL`.
> **Fix:** Match the variable names exactly in both `server` and `runtimeEnv`.

---

## 4. Auto Login & Admin Config

In `payload.config.ts`, add `autoLogin` inside the `admin` section (after `importMap`, before `collections`):

```ts
import { env } from './lib/env'

autoLogin: {
  email: env.CMS_SEED_ADMIN_EMAIL,
  password: env.CMS_SEED_ADMIN_PASSWORD,
},
```

> **⚠️ Error — autoLogin Not Working (Redirect to /admin/create-first-user)**
> **Cause:** `autoLogin` only logs in an *existing* user — it does not create one. No admin user existed in the DB.
> **Fix:** Run `npm run seed` to create the admin user first, then `autoLogin` works correctly.

---

### Nuke Script

Add to `package.json`:

```json
"nuke": "psql -U postgres -d payload_next_blog -c \"DROP SCHEMA public CASCADE; CREATE SCHEMA public;\" && npm run seed"
```

> **⚠️ Error — nr Command Not Recognized**
> **Symptom:** `nr not recognized`
> **Cause:** `@antfu/ni` package not installed globally.
> **Fix:** `npm install -g @antfu/ni`

> **⚠️ Error — psql Authentication Failed in Nuke Script**
> **Symptom:** `password authentication failed for user "user"` (Windows username)
> **Cause:** `psql` was connecting as the Windows/system username instead of the postgres superuser.
> **Fix:** Add `-U postgres` flag to the psql command in the nuke script.

> **⚠️ Error — pnpm Not Recognized**
> **Symptom:** `pnpm is not recognized` during nuke.
> **Cause:** `pnpm` not installed; the nuke script used it.
> **Fix:** Replace `pnpm run seed` with `npm run seed` in the nuke script.

> **⚠️ Error — Migration Failed (Relation Already Exists)**
> **Symptom:** `relation "users_sessions" already exists`
> **Cause:** Payload had already pushed the schema dynamically in dev mode, so running migrations tried to create tables that already existed.
> **Fix:** Drop and recreate the schema in psql:
> ```sql
> DROP SCHEMA public CASCADE;
> CREATE SCHEMA public;
> ```
> Then re-run migrations. Alternatively, use `push: true` in the Postgres adapter.

Run:

```bash
npm run nuke
```

Commit: `feat: admin seeder`

---

## 5. Building Collections

### Folder Structure

```
src/collections/
  Articles/
    hooks/
      generate-slug.hook.ts
      generate-content-summary.hook.ts
    config.ts
    constants.ts
    fetchers.ts
  ArticleAuthors/
    config.ts
    constants.ts
  Media/
    lib/
      generate-blur-data-url.ts
    config.ts
```

---

### `Articles/hooks/generate-slug.hook.ts`

```ts
import { Article } from '@/payload-types'
import type { FieldHook } from 'payload'
import { slugify } from 'payload/shared'

export const generateSlugHook: FieldHook<Article, string> = ({ value, data }) => {
  if (value) return slugify(value.trim()) || ''
  return slugify(data?.title?.trim() || '') || ''
}
```

---

### `Articles/hooks/generate-content-summary.hook.ts`

```ts
import { Article } from '@/payload-types'
import type { FieldHook } from 'payload'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { MAX_SUMMARY_LENGTH } from '../constants'

export const generateContentSummaryHook: FieldHook<Article, string> = ({ value, data }) => {
  if (value) return value.trim()
  if (!data?.content) return ''
  const text = convertLexicalToPlaintext({ data: data?.content }).trim()
  if (!text) return ''
  return text.length > MAX_SUMMARY_LENGTH ? `${text.slice(0, MAX_SUMMARY_LENGTH - 3)}...` : text
}
```

---

### `Articles/constants.ts`

```ts
export const MAX_SUMMARY_LENGTH = 160

export const STATUS_OPTIONS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
} as const

export const CACHE_TAG_ARTICLES = 'articles'
```

---

### `Articles/config.ts`

```ts
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'
import { CACHE_TAG_ARTICLES, STATUS_OPTIONS } from './constants'
import { generateContentSummaryHook } from './hooks/generate-content-summary.hook'
import { generateSlugHook } from './hooks/generate-slug.hook'

export const Articles: CollectionConfig = {
  slug: 'articles',
  fields: [
    { name: 'title', type: 'text', required: true, unique: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlugHook] },
    },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'contentSummary',
      type: 'textarea',
      required: true,
      hooks: { beforeValidate: [generateContentSummaryHook] },
    },
    {
      name: 'readTimeInMins',
      type: 'number',
      defaultValue: 0,
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.readTimeInMins
          },
        ],
        afterRead: [
          ({ data }) => {
            const text = convertLexicalToPlaintext({ data: data?.content })
            const wordsPerMinute = 200
            const words = text.trim().split(/\s+/).length
            return Math.max(1, Math.ceil(words / wordsPerMinute))
          },
        ],
      },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'author', type: 'relationship', relationTo: 'article-authors', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: Object.values(STATUS_OPTIONS),
      defaultValue: STATUS_OPTIONS.DRAFT,
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        condition: (data) => data?.status === STATUS_OPTIONS.PUBLISHED,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  hooks: {
    afterChange: [
      () => {
        try {
          revalidateTag(CACHE_TAG_ARTICLES, 'page')
        } catch {
          // Silently ignore — revalidateTag only works inside a running Next.js app
        }
      },
    ],
  },
}
```

> **⚠️ Error — revalidateTag Error During Seeding**
> **Symptom:** `Invariant: static generation store missing in revalidateTag articles`
> **Cause:** `revalidateTag` is a Next.js server function that only works inside a running Next.js app, not in a standalone seed script.
> **Fix:** Wrap it in a `try/catch` block to silently ignore the error during seeding (as shown above).

> **⚠️ Error — revalidateTag Deprecation Warning**
> **Symptom:** `revalidateTag without second argument is deprecated`
> **Cause:** New Next.js version requires a second argument.
> **Fix:** Add `'page'` as the second argument: `revalidateTag(CACHE_TAG_ARTICLES, 'page')`

> **⚠️ Error — revalidateTag TypeScript Error**
> **Symptom:** `Expected 2 arguments, but got 1`
> **Cause:** TypeScript strict checking on the new Next.js version.
> **Fix:** Add `'page'` as the second argument.

> **⚠️ Error — Article Type Not Found in `@/payload-types`**
> **Symptom:** `Article type not found`
> **Cause:** Types hadn't been generated yet.
> **Fix:** Run `npx payload generate:types`

---

### `ArticleAuthors/constants.ts`

```ts
export const ARTICLE_AUTHOR_ROLE_OPTIONS = {
  STAFF_WRITER: 'Staff Writer',
  GUEST_WRITER: 'Guest Writer',
  FLO_RIDA: 'Flo Rida',
  CONTRIBUTOR: 'Contributor',
  EDITOR: 'Editor',
} as const
```

---

### `ArticleAuthors/config.ts`

```ts
import { CollectionConfig } from 'payload'
import { ARTICLE_AUTHOR_ROLE_OPTIONS } from './constants'

export const ArticleAuthors: CollectionConfig = {
  slug: 'article-authors',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'avatar', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'role',
      type: 'select',
      options: Object.values(ARTICLE_AUTHOR_ROLE_OPTIONS),
      defaultValue: ARTICLE_AUTHOR_ROLE_OPTIONS.STAFF_WRITER,
      required: true,
    },
  ],
}
```

Register both collections in `payload.config.ts`:

```ts
collections: [Users, Media, Articles, ArticleAuthors],
```

Add the `FixedToolbarFeature` to the lexical editor in `payload.config.ts`:

```ts
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
}),
```

Commit: `feat(schemas): article, article authors`

---

## 6. Media Collection & Blur Hashing

### Install Dependencies

```bash
npm install @plaiceholder/next
```

Update `next.config.mjs`:

```js
import withPlaiceholder from '@plaiceholder/next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPlaiceholder(withPayload(nextConfig, { devBundleServerPackages: false }))
```

---

### `Media/lib/generate-blur-data-url.ts`

```ts
import type { Buffer } from 'node:buffer'
import { getPlaiceholder } from 'plaiceholder'

export function isEligibleForBlurDataURL(mime?: string | null) {
  if (!mime?.startsWith('image/')) return false
  if (mime === 'image/svg+xml') return false
  return true
}

export async function generateBlurDataURL(
  buffer?: Buffer<ArrayBufferLike>,
): Promise<string | null> {
  if (!buffer) {
    console.warn('Failed to generate blur data URL: missing buffer')
    return null
  }
  const { base64 } = await getPlaiceholder(buffer)
  return base64
}
```

---

### `Media/config.ts`

```ts
import type { CollectionConfig } from 'payload'
import { generateBlurDataURL, isEligibleForBlurDataURL } from './lib/generate-blur-data-url'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'blurDataUrl', type: 'text', required: true, admin: { hidden: true } },
  ],
  upload: true,
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation !== 'create') return data
        if (!isEligibleForBlurDataURL(req.file?.mimetype)) return data
        const base64 = await generateBlurDataURL(req.file?.data)
        if (!base64) return data
        data.blurDataUrl = base64
        console.log(`Generated blur data URL for ${data.filename}`)
        return data
      },
    ],
  },
}
```

Commit: `feat(media): blur data urls`

---

## 7. Seeders — Article Authors & Articles

### `lib/payload/client.ts`

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'

let payload: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payload) {
    payload = await getPayload({ config })
  }
  return payload
}
```

---

### Install Faker.js

```bash
npm install @faker-js/faker
```

---

### `seeders/lib/create-media-from-image-url.ts`

```ts
import { faker } from '@faker-js/faker'
import { Payload } from 'payload'

export async function createMediaFromImageUrl(payload: Payload, imageUrl: string) {
  try {
    const res = await fetch(imageUrl)
    const arrBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrBuffer)
    const mimetype = res.headers.get('content-type') || 'image/jpeg'
    const filesize = buffer.length
    const filename = res.url.split('/').pop()?.split('?')[0]
    if (!filename) throw new Error('Failed to extract filename')
    return await payload.create({
      collection: 'media',
      draft: true,
      data: { alt: faker.lorem.words(3) },
      file: { data: buffer, name: filename, mimetype, size: filesize },
    })
  } catch (error) {
    console.warn('Failed to seed media file', error)
  }
}
```

---

### `seeders/article-author.seeder.ts`

```ts
import { Payload } from 'payload'
import { faker } from '@faker-js/faker'
import { ARTICLE_AUTHOR_ROLE_OPTIONS } from '@/collections/ArticleAuthors/constants'
import { createMediaFromImageUrl } from '../lib/create-media-from-image-url'

export async function seedArticleAuthor(payload: Payload) {
  try {
    const imageUrl = faker.image.personPortrait({ size: 256 })
    const image = await createMediaFromImageUrl(payload, imageUrl)
    if (!image) {
      console.warn('Stopped seeding article author because no image was created')
      return
    }
    await payload.create({
      collection: 'article-authors',
      data: {
        name: faker.person.fullName(),
        role: ARTICLE_AUTHOR_ROLE_OPTIONS.STAFF_WRITER,
        avatar: image.id,
      },
    })
  } catch (error) {
    console.warn('Failed to seed article author', error)
  }
}
```

Commit: `feat(seeders): article authors`

---

### `seeders/articles.seeder.ts`

```ts
import { faker } from '@faker-js/faker'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { Payload } from 'payload'
import config from '@/payload.config'
import { MAX_SUMMARY_LENGTH, STATUS_OPTIONS } from '@/collections/Articles/constants'
import { createMediaFromImageUrl } from '../lib/create-media-from-image-url'
import { slugify } from 'payload/shared'

const ARTICLES_COUNT = 5

export async function seedArticles(payload: Payload) {
  let successCount = 0
  for (let i = 0; i < ARTICLES_COUNT; i++) {
    try {
      const imageUrl = faker.image.urlPicsumPhotos()
      const image = await createMediaFromImageUrl(payload, imageUrl)
      if (!image) {
        console.warn('Stopped seeding article because no image was created')
        return
      }
      const title = faker.lorem.sentence()
      const content = faker.lorem.paragraphs(3)
      const contentLexical = convertMarkdownToLexical({
        markdown: content,
        editorConfig: await editorConfigFactory.default({ config: await config }),
      })
      const status = faker.helpers.arrayElement(Object.values(STATUS_OPTIONS))
      await payload.create({
        collection: 'articles',
        data: {
          title,
          content: contentLexical,
          contentSummary: content.slice(0, MAX_SUMMARY_LENGTH),
          author: 1,
          coverImage: image.id,
          slug: slugify(title),
          status,
          ...(status === 'Published' && {
            publishedAt: faker.date.recent() as unknown as string,
          }),
        },
        draft: true,
      })
      successCount++
    } catch (error) {
      console.error('Failed to seed article', error)
    }
  }
}
```

> **⚠️ Error — Duplicate Blob Error When Reseeding**
> **Symptom:** `This blob already exists, use allowOverwrite: true`
> **Cause:** A previous seed had already uploaded images to Vercel Blob.
> **Fix:** Delete all existing blobs from the Vercel Blob dashboard, then reseed.

---

### Final `script.ts`

```ts
import { getPayloadClient } from '@/lib/payload/client'
import { seedAdmin } from './seeders/admin.seeder'
import { seedArticleAuthor } from './seeders/article-author.seeder'
import { seedArticles } from './seeders/articles.seeder'

async function main() {
  const payload = await getPayloadClient()
  try {
    await seedAdmin(payload)
    await seedArticleAuthor(payload)
    await seedArticles(payload)
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

void main()
```

Run:

```bash
npm run seed
```

---

## 8. Building the Frontend

### Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss
npm install -D @tailwindcss/typography
npm install next-themes
```

> **⚠️ Error — Tailwind v4 Squiggly Lines in VS Code**
> **Symptom:** Yellow squiggles under `@plugin`, `@theme`, `@utility` in CSS files.
> **Cause:** VS Code's built-in CSS validator doesn't understand Tailwind v4 syntax.
> **Fix:** Add to VS Code settings:
> ```json
> "css.validate": false,
> "css.lint.unknownAtRules": "ignore"
> ```
> Alternatively, update the Tailwind CSS IntelliSense extension to v0.12.0+.

> **⚠️ Error — @tailwindcss/typography Build Error**
> **Symptom:** `Can't resolve '@tailwindcss/typography'` or `"./typography" is not exported`
> **Cause:** Either the `@plugin` directive was changed to `@import`, or the plugin was referenced incorrectly.
> **Fix:** Use the correct directive in `globals.css`:
> ```css
> @plugin '@tailwindcss/typography';
> ```

---

### `postcss.config.mjs`

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

---

### `(frontend)/globals.css`

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

@theme {
  --color-dimmed: theme('colors.gray.400');
}

@layer base {
  body {
    @apply text-gray-100;
  }
}

@utility container {
  @apply mx-auto h-full max-w-6xl px-3;
}
```

---

### `(frontend)/page.tsx`

```tsx
import { redirect } from 'next/navigation'

export default async function HomePage() {
  redirect('/blog')
}
```

> **⚠️ Error — Vercel Showing "Hello world!" Instead of Blog**
> **Symptom:** Homepage shows placeholder text.
> **Cause:** `page.tsx` still had the default placeholder.
> **Fix:** Replace with `redirect('/blog')` as shown above.

---

### `(frontend)/layout.tsx`

```tsx
import React from 'react'
import './globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
  icons: { icon: '/favicon.png' },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Commit: `chore(deps): next themes`

---

### Frontend File Structure

```
src/app/(frontend)/
  blog/
    _components/
      article-card.tsx
      article-metadata.tsx
    [slug]/
      layout.tsx
      loading.tsx
      page.tsx
    layout.tsx
    loading.tsx
    page.tsx
  globals.css
  layout.tsx
  page.tsx
```

---

### `blog/_components/article-metadata.tsx`

```tsx
import { Media } from '@/payload-types'
import Image from 'next/image'

export function ArticleMetadata({
  data,
  intent,
  className,
}: {
  data: {
    author: { avatar: Media; name: string; role: string }
    publishedAt: Date
    readTimeMins: number
  }
  intent: 'card' | 'post'
  className?: string
}) {
  const { author, publishedAt, readTimeMins } = data
  return (
    <div className={`mt-4 flex items-center justify-between ${className}`}>
      <div className={`flex items-center ${intent === 'card' ? 'gap-2' : 'gap-3'}`}>
        <Image
          src={author.avatar.url ?? ''}
          alt={`${author.name}'s avatar`}
          width={40}
          height={40}
          className={`rounded-full ${intent === 'card' ? 'size-10' : 'size-11'}`}
          sizes="40px"
        />
        <div className={`flex flex-col leading-none ${intent === 'card' ? 'text-sm gap-1.5' : 'text-base gap-2'}`}>
          <p className="font-bold">{author.name}</p>
          <p className="text-dimmed">{author.role}</p>
        </div>
      </div>
      <div className={`flex flex-col text-right ${intent === 'card' ? 'text-sm gap-1.5' : 'text-base gap-2'}`}>
        <time dateTime={new Date(publishedAt).toISOString()} className="leading-none">
          {publishedAt.toLocaleString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
        <p className="text-dimmed leading-none">{readTimeMins} minutes read</p>
      </div>
    </div>
  )
}
```

---

### `blog/_components/article-card.tsx`

```tsx
import { Media } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { ArticleMetadata } from './article-metadata'

type ArticleCardProps = {
  href: string
  title: string
  summary: string
  coverImage: Media
  publishedAt: Date
  readTimeMins: number
  author: { avatar: Media; name: string; role: string }
}

export function ArticleCard({
  href, title, summary, coverImage, publishedAt, readTimeMins, author,
}: ArticleCardProps) {
  return (
    <Link href={href} aria-label={`Read article: "${title}"`} className="block h-full">
      <article className="rounded-md border border-gray-700 overflow-hidden h-full flex flex-col">
        {/* cover image */}
        <div className="relative aspect-[16/9]">
          <Image
            src={coverImage.url ?? ''}
            alt={`Cover image for "${title}"`}
            fill
            className="object-cover object-center"
          />
        </div>
        {/* content */}
        <div className="p-3 flex flex-col flex-1">
          <header>
            <h2 className="font-bold text-lg line-clamp-1">{title}</h2>
            <p className="mt-2 line-clamp-3">{summary}</p>
          </header>
          <ArticleMetadata
            intent="card"
            data={{ author, publishedAt, readTimeMins }}
            className="mt-auto"
          />
        </div>
      </article>
    </Link>
  )
}

export function ArticleCardSkeleton() {
  return <div className="rounded-md h-87.5 animate-pulse bg-gray-700" />
}
```

> **⚠️ Error — Uneven Article Card Heights (line-clamp)**
> **Symptom:** Cards looked messy because titles and summaries were different lengths.
> **Fix:** Added `line-clamp-1` on title, `line-clamp-3` on summary, and `flex flex-col flex-1` on the content div.

> **⚠️ Error — Missing `flex` on Content Div**
> **Symptom:** Author/date info didn't stick to the bottom despite `mt-auto`.
> **Cause:** The content area had `flex-col flex-1` but was missing `flex`, so it remained a block element.
> **Fix:** Added `flex` to the content div.

> **⚠️ Error — `h-full` Missing from Link Wrapper**
> **Symptom:** Cards in the same grid row wouldn't stretch to equal height.
> **Cause:** Without `h-full` on the outer `<Link>`, height couldn't propagate correctly.
> **Fix:** Added `h-full` to both the `<Link>` wrapper and inner `<article>`.

> **⚠️ Error — Broken Tailwind Class on Image Container**
> **Symptom:** Images rendered at full natural height, causing cards to grow to wildly different sizes.
> **Cause:** The image container class was missing an opening `[` bracket (e.g. `max-h-3200px]`), making the class invalid. Tailwind silently ignored it.
> **Fix:** Replaced with a `relative` wrapper div using `aspect-[16/9]` and a `fill` Next.js `<Image>`, guaranteeing consistent card image height.

---

### `Articles/fetchers.ts`

```ts
import { getPayloadClient } from '@/lib/payload/client'
import { CACHE_TAG_ARTICLES, STATUS_OPTIONS } from './constants'
import { unstable_cache } from 'next/cache'

async function _getPublishedArticles() {
  const payload = await getPayloadClient()
  try {
    const { docs: articles } = await payload.find({
      collection: 'articles',
      depth: 2,
      where: { status: { equals: STATUS_OPTIONS.PUBLISHED } },
      select: {
        slug: true,
        title: true,
        contentSummary: true,
        author: true,
        coverImage: true,
        status: true,
        readTimeInMins: true,
        publishedAt: true,
      },
    })
    return articles ?? []
  } catch (error) {
    console.error('Failed to fetch articles', error)
    return []
  }
}

export function getPublishedArticles() {
  return unstable_cache(_getPublishedArticles, [], {
    tags: [CACHE_TAG_ARTICLES],
  })()
}

export async function getArticleBySlug(slug: string) {
  const payload = await getPayloadClient()
  try {
    const { docs: articles } = await payload.find({
      collection: 'articles',
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
    })
    const [firstArticle] = articles ?? []
    return firstArticle ?? null
  } catch (error) {
    console.error('Failed to fetch articles', error)
    return null
  }
}
```

> **⚠️ Error — Blog Only Showing 1 Out of 3 Articles**
> **Symptom:** Blog index page displayed only 1 of 3 published articles.
> **Cause:** `payload.find()` was missing a `depth` parameter (defaulting to `depth: 0`), so relations were returned as plain IDs. Guard clauses in `page.tsx` then silently filtered out any article with unresolved relations.
> **Fix:** Add `depth: 2` to the `payload.find()` call. Also restart the dev server to clear stale `unstable_cache` results.
>
> | Depth | Returns | Result |
> |-------|---------|--------|
> | 0 (default) | IDs | All relations returned as IDs |
> | 1 | Partial | `coverImage` and `author` populated, `author.avatar` still an ID |
> | 2 | Full | `author.avatar` also populated |

---

### `lib/payload/helpers/relation-is-object.ts`

```ts
export function relationIsObject<T>(relation: number | T): relation is T {
  return typeof relation !== 'number'
}
```

---

### `lib/components/rich-text.tsx`

```tsx
import type { DefaultNodeTypes, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { LinkJSXConverter, RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { relationTo, value } = linkNode.fields.doc!
  if (typeof value !== 'object') throw new TypeError('Expected value to be an object')
  const slug = value.slug
  switch (relationTo) {
    case 'articles': return `/blog/${slug}`
    default: return `/${relationTo}/${slug}`
  }
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

export const RichText: React.FC<{ lexicalData: SerializedEditorState }> = ({ lexicalData }) => {
  return <PayloadRichText converters={jsxConverters} data={lexicalData} />
}
```

---

### `blog/page.tsx`

```tsx
import { getPublishedArticles } from '@/collections/Articles/fetchers'
import { ArticleCard } from './_components/article-card'
import { relationIsObject } from '@/lib/payload/helpers/relation-is-object'

export default async function BlogIndexPage() {
  const articles = await getPublishedArticles()
  if (!articles.length) return <p>No articles found</p>
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      {articles.map(({ id, title, slug, contentSummary, coverImage, readTimeInMins, publishedAt, author }) => {
        if (!relationIsObject(coverImage)) return null
        if (!relationIsObject(author) || !relationIsObject(author.avatar)) return null
        return (
          <ArticleCard
            key={id}
            title={title}
            href={`/blog/${slug}`}
            summary={contentSummary}
            readTimeMins={readTimeInMins ?? 0}
            publishedAt={new Date(publishedAt ?? new Date())}
            coverImage={coverImage}
            author={{ avatar: author.avatar, name: author.name, role: author.role }}
          />
        )
      })}
    </div>
  )
}
```

---

### `blog/loading.tsx`

```tsx
import { ArticleCardSkeleton } from './_components/article-card'

export default function BlogIndexPageLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <ArticleCardSkeleton key={index} />
      ))}
    </div>
  )
}
```

---

### `blog/layout.tsx`

```tsx
export default function BlogIndexLayout({ children }: { children: React.ReactNode }) {
  return <div className="container py-20">{children}</div>
}
```

---

### `blog/[slug]/layout.tsx`

```tsx
import Link from 'next/link'

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl w-full mx-auto">
      <Link
        href="/blog"
        aria-label="Back to blog"
        className="inline-flex items-center gap-2 mb-8 no-underline relative after:content-[''] after:absolute after:left-1 after:-bottom-1 after:right-0 after:h-0.5 after:bg-gray-600 after:hidden hover:after:block"
      >
        <ArrowLeftIcon />
        All articles
      </Link>
      {children}
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}
```

---

### `blog/[slug]/loading.tsx`

```tsx
export default function BlogPostPageLoading() {
  return <p>Loading...</p>
}
```

Commit: `feat: render blog`

---

## 9. Deployment

### Database — Neon

Create a Neon PostgreSQL database and add the connection string to `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
```

> **⚠️ Error — Neon Database Was Empty on Vercel**
> **Symptom:** Blog page had no articles on the live deployment.
> **Cause:** Data only existed in local PostgreSQL, not in the Neon cloud database.
> **Fix:** Temporarily switch `DATABASE_URL` to Neon and run `npm run seed`.

> **⚠️ Error — PostgreSQL Connection Failed — Wrong Credentials in .env**
> **Symptom:** `password authentication failed for user "bhoomika"`
> **Cause:** The `.env` file had wrong credentials — that user didn't exist in PostgreSQL.
> **Fix:** Change `DATABASE_URL` to use the postgres superuser, or create the user in PostgreSQL with the correct password.

---

### Media Storage — Vercel Blob

1. Go to Vercel Dashboard → Storage → Create Database → Blob.
2. Name it, set to Public, connect your project.
3. Install the package:

```bash
npm install @payloadcms/storage-vercel-blob@3.81.0
```

> **⚠️ Error — Payload Package Version Mismatch**
> **Symptom:** `@payloadcms/plugin-cloud-storage@3.83.0 doesn't match 3.81.0`
> **Cause:** `npm install` grabbed the latest version instead of the matching version.
> **Fix:** Install the exact matching version: `npm install @payloadcms/storage-vercel-blob@3.81.0`

Add to `.env`:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

Update `payload.config.ts` to include the Vercel Blob plugin:

```ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

plugins: [
  vercelBlobStorage({
    enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
],
```

> **⚠️ Error — Images Not Showing on Vercel**
> **Symptom:** Article cover images showing as broken / alt text.
> **Cause:** Images were only stored locally, not in cloud storage.
> **Fix:** Set up Vercel Blob Storage and configure Payload to use it (as above).

> **⚠️ Error — Author Avatar Images Not Showing**
> **Symptom:** Avatar images broken on live site.
> **Cause:** Vercel Blob hostname not whitelisted in `next.config.ts`.
> **Fix:** Add to `remotePatterns` in `next.config.ts`:
> ```ts
> { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }
> ```

---

### Migrations

Generate and commit migrations:

```bash
npx payload migrate:create
```

Commit the generated `src/migrations/` folder.

> **⚠️ Error — Missing Migrations File**
> **Symptom:** `payload.config.ts importing ./migrations/index.js but the file didn't exist on Vercel`
> **Cause:** The `src/migrations/` folder had never been generated or committed to git.
> **Fix:** Run `npx payload migrate:create` locally, then commit and push.

> **⚠️ Error — Wrong File Extension in Migrations Import**
> **Symptom:** `Turbopack couldn't resolve ./migrations/index.js — only index.ts existed`
> **Cause:** The import in `payload.config.ts` used the `.js` extension explicitly.
> **Fix:** Change the import from `'./migrations/index.js'` to `'./migrations/index'`

Add to the `build` script in `package.json`:

```json
"build": "payload migrate && next build"
```

> **⚠️ Error — Payload Interactive Prompt Hanging the Build**
> **Symptom:** During Vercel static page generation, Payload displayed an interactive confirmation prompt that timed out after 60 seconds, killing the build.
> **Cause:** Payload detected the schema was set up via dev-mode push rather than migrations.
> **Fix:** Run `npx payload migrate` locally pointed at the production `DATABASE_URL` to mark migrations as applied, then add `payload migrate &&` to the build script.

---

### Vercel Environment Variables

Set all of the following in Vercel → Project Settings → Environment Variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PAYLOAD_SECRET` | Any long random string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |
| `CMS_SEED_ADMIN_EMAIL` | Admin email for seeding |
| `CMS_SEED_ADMIN_PASSWORD` | Admin password for seeding |
| `NEXT_PUBLIC_SERVER_URL` | Your deployed Vercel URL |

> **⚠️ Error — enableServerFastRefresh Warning from withPayload**
> **Symptom:** `Invalid next.config.ts options detected: Unrecognized key(s) in object: 'enableServerFastRefresh'`
> **Cause:** The key `enableServerFastRefresh` was removed in Next.js 16 but is still being injected internally by `withPayload`.
> **Fix:** After `withPayload` processes the config, delete the invalid key before exporting. The warning is harmless but this eliminates the noise.

Commit: `connection to database done`

---

*End of Documentation*
