import { faker } from '@faker-js/faker'
import { Payload } from 'payload'

export async function createMediaFromImageUrl(payload: Payload, imageUrl: string) {
    try {
        const imageUrl = faker.image.personPortrait({ size: 256 })

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
            file: {
                data: buffer,
                name: filename,
                mimetype,
                size: filesize,
            },
        })
    } catch (error) {
        console.warn('failed to seed media file', error);
    }
}