import { seedAdmin } from './seeders/admin.seeder'

async function main() {
    try {
        await seedAdmin
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

void main()
