import {useLoaderData} from '@remix-run/react';
import PostCard from '~/components/PostCard';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import Post_Service from '~/Services/Post';

export async function loader({params}) {
  const {postId} = params;

  const post = await Post_Service.getPostById(postId);
  if (!post) {
    throw new Response('Blog not found', {status: 404});
  }

  const relatedPosts = await Post_Service.getPosts();

  return {post, relatedPosts};
}

export default function Post() {
  const {post, relatedPosts} = useLoaderData();

  const filteredPosts = relatedPosts.filter(
    (relatedPost) => relatedPost.id !== post.id,
  );

  return (
    <div className="px-16 py-10">
      <div>
        <p className="text-4xl font-bold">{post.title}</p>
        <p className="pt-3 text-lg font-medium">
          {post.authorName} | {post.date}
        </p>
        <div className="w-full h-80 bg-gray-300 border border-black rounded-md my-8"></div>
        <p className="text-justify text-lg">{post.description}</p>
      </div>

      <div className="my-12">
        <p className="text-4xl font-bold">Related Posts</p>
        <div className="blogs-grid">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-7">
            {filteredPosts.map((relatedPost) => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
