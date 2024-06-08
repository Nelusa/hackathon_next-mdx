import Link from "next/link";
import {getAllPosts} from "@/lib/posts";

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
