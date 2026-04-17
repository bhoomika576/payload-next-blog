import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Optional: only needed for local dev autoLogin
    CMS_SEED_ADMIN_EMAIL: z.email().optional(),
    CMS_SEED_ADMIN_PASSWORD: z.string().min(1).optional(),
  },
  client: {
    //
  },
  runtimeEnv: {
    CMS_SEED_ADMIN_EMAIL: process.env.CMS_SEED_ADMIN_EMAIL,
    CMS_SEED_ADMIN_PASSWORD: process.env.CMS_SEED_ADMIN_PASSWORD,
  },
})