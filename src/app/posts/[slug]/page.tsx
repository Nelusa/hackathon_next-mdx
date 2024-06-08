import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import Post from "@/components/Post"
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map(slug => ({ slug: slug.replace(/\.mdx$/, '') }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  return { title: post.data.title }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const mdxSource: MDXRemoteSerializeResult = await serialize(post.content, { scope: post.data })
  return <Post source={mdxSource} />
}
