import {defer} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import PostCard from '~/components/PostCard';
import ButtonComponent from '~/components/Button';
import FilterBy from '~/components/FilterBy';
import Post_Service from '~/Services/Post';
import Pagination from '~/components/Pagination';
import Accordiance from '~/components/Accordiance';
import {useState} from 'react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Blogs`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  // const [{blogs}] = await Promise.all([
  //   context.storefront.query(BLOGS_QUERY, {
  //     variables: {
  //       ...paginationVariables,
  //     },
  //   }),
  //   // Add other queries here, so that they are loaded in parallel
  // ]);

  const posts = await Post_Service.getPosts();

  return {posts};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {posts} = useLoaderData();

  return (
    <div>
      <div className="w-full h-80 bg-gray-300 flex flex-wrap justify-center items-center border border-black rounded-md">
        <div className="max-w-96">
          <h3 className="text-center text-3xl font-bold">Blog Listing Page</h3>
          <p className="text-center py-7 text-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, sint
            impedit, labore dolorum voluptas pariatur recusandae aliquam
          </p>
        </div>
      </div>
      <div className="flex justify-end pt-7">
        <FilterBy text={'Newest First'} className={'min-w-96'} />
      </div>
      <div className="blogs-grid">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-7">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              src={
                'https://www.infoworld.com/wp-content/uploads/2024/06/1200px-burmese_python_02-100637340-orig.jpg?quality=50&strip=all'
              }
              post={post}
            />
          ))}
        </div>
      </div>
      <Pagination />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
