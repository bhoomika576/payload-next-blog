import { faker } from '@faker-js/faker'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { Payload } from 'payload'
import config from '@/payload.config'
import { MAX_SUMMARY_LENGTH, STATUS_OPTIONS } from '@/collections/Articles/constant'
import { createMediaFromImageUrl } from '../lib/create-media-from image-url'
import { slugify } from 'payload/shared'

const ARTICLES_COUNT = 5

export async function seedArticles(payload: Payload) {
    let successCount = 0

    for (let i = 0; i < ARTICLES_COUNT; i++) {
        try {
            const imageUrl = faker.image.urlPicsumPhotos()
            const image = await createMediaFromImageUrl(payload, imageUrl)
            if (!image) {
                console.warn('Stopped seeding article author because no image was created')
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
