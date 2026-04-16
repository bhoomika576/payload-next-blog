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
    author: {
        avatar: Media
        name: string
        role: string
    }
}

export function ArticleCard({
    href,
    title,
    summary,
    coverImage,
    publishedAt,
    readTimeMins,
    author,
}: ArticleCardProps) {
    return (
        <Link href={href} aria-label={`Read article: "${title}"`} className="block h-full">
            <article className="rounded-md border border-gray-700 overflow-hidden h-full flex flex-col">
                {/* cover image */}
                <div className="relative w-full aspect-[16/9] shrink-0">
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
                        <h2 className="font-bold text-lg line-clamp-2">{title}</h2>
                        <p className="mt-2 line-clamp-3 text-sm text-gray-400">{summary}</p>
                    </header>

                    <ArticleMetadata
                        intent="card"
                        data={{ author, publishedAt, readTimeMins }}
                        className="mt-auto pt-3"
                    />
                </div>
            </article>
        </Link>
    )
}

export function ArticleCardSkeleton() {
    return <div className="rounded-md h-87.5 animate-pulse bg-gray-700" />
}
