import { getPayload } from 'payload'
import config from '@/payload.config'

export async function seedAdmin() {
    const payload = await getPayload({ config })

    try {
        const response = await payload.create({
            collection: 'users',
            data: {
                email: 'admin@example.com',
                password: 'password',
            },
        })
        console.log('Admin user created:', response)
    } catch (error) {
        console.error('Error seeding admin user:', JSON.stringify(error, null, 2))
    }
}
