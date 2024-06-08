### Krok 1: Instalace potřebných balíčků

Nejprve potřebujeme nainstalovat několik balíčků, které nám umožní pracovat s MDX v Next.js.

1. Otevři svůj projekt v terminálu.
2. Spusť následující příkazy:

```bash
npm install @next/mdx next-mdx-remote gray-matter
```

### Krok 2: Nastavení projektu

1. Vytvoř složku `src/content`, kde budou MDX soubory.
2. Ujisti se, že máš složku `lib`, kde budeš mít pomocné funkce pro načítání MDX souborů.

### Krok 3: Vytvoření pomocných funkcí pro načítání MDX souborů

Vytvoř si soubor `lib/posts.js` a přidej následující kód:

```tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

const postsDirectory = path.join(process.cwd(), 'src/content')

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory)
}

export function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return { data, content, slug: realSlug }
}

export async function getAllPosts() {
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
```

### Krok 4: Vytvoření hlavní stránky

Vytvoř si soubor `app/page.jsx` pro hlavní stránku, která zobrazí seznam příspěvků:

```tsx
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div>
      <h1>My Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>
              {post.data.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Krok 5: Vytvoření dynamické stránky pro příspěvky

Vytvoř složku `app/posts/[slug]` a v ní soubor `page.jsx`:

```tsx
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import Post from '@/components/Post'
import { serialize } from 'next-mdx-remote/serialize'

// Funkce pro generování statických cest pro příspěvky
export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map(slug => ({ slug: slug.replace(/\.mdx$/, '') }))
}

// Funkce pro generování metadat pro příspěvky
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  return { title: post.data.title }
}

// Komponenta pro zobrazení příspěvku
export default async function PostPage({ params }) {
  const post = getPostBySlug(params.slug)
  const mdxSource = await serialize(post.content, { scope: post.data })
  return <Post source={mdxSource} />
}
```

### Krok 6: Vytvoření komponenty pro zobrazení MDX obsahu

Vytvoř soubor `components/Post.tsx`:

```jsx
"use client"

import dynamic from 'next/dynamic'
const MDXRemote = dynamic(() => import('next-mdx-remote').then(mod => mod.MDXRemote), { ssr: false })

export default function Post({ source }) {
  return (
    <div>
      <MDXRemote {...source} />
    </div>
  )
}
```

### Krok 7: Přidání MDX souborů

Do složky `src/content` přidej své MDX soubory. Například `first-post.mdx`:

```markdown
---
title: "First Post"
date: "2024-06-07"
---

# Hello, world!

This is my first MDX post.
```