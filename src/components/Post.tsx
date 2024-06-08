"use client"
import dynamic from 'next/dynamic'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'

const MDXRemote = dynamic(() => import('next-mdx-remote').then(mod => mod.MDXRemote), { ssr: false })

interface PostProps {
  source: MDXRemoteSerializeResult
}

export default function Post({ source }: PostProps) {
  return (
    <div>
      <MDXRemote {...source} />
    </div>
  )
}
