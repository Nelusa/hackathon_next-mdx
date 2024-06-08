import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

const postsDirectory = path.join(process.cwd(), 'src/content')

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory)
}

export function getPostBySlug(slug: string): { data: any; content: string; slug: string } {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return { data, content, slug: realSlug }
}

export async function getAllPosts(): Promise<{ data: any; content: string; slug: string; mdxSource: MDXRemoteSerializeResult }[]> {
  const slugs = getPostSlugs()
  const posts = slugs.map(slug => getPostBySlug(slug))

  const mdxPosts = await Promise.all(posts.map(async (post) => {
    const mdxSource = await serialize(post.content, { scope: post.data })
    return {
      ...post,
      mdxSource,
    }
  }))

  return mdxPosts
}
