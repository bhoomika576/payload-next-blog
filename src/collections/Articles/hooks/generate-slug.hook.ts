import { slugify } from 'payload/shared'
import type { CollectionConfig, FieldHook } from 'payload'
import { Article } from '@/payload-types'

export const generateSlugHook: FieldHook<Article, string> = ({ value, data }) => {
    if (value) return slugify(value.trim()) || ''
    return slugify(data?.title?.trim() || '') || ''
}
