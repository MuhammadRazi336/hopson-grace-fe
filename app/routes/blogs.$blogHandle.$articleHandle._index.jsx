import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {json, Link, useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import lineImghead from '/assets/Images/WhiteLine.png';
import BlackLine from '/assets/Images/line.png';
import Heading from '~/components/Heading';

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        metafield(namespace: "custom", key: "userId") {
          value
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

export async function loader({context, params}) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {blogHandle, articleHandle},
  });

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  let registry = null;
  let registryProduct = null;

  try {
    if (blog.articleByHandle.metafield?.value) {
      registry = await context.ClientGet(
        `registries/by-userId/${blog.articleByHandle.metafield.value}`,
        context,
      );
      console.log('registry', registry?.data?.[0]?.id);

      if (registry?.data?.[0]?.id) {
        registryProduct = await context.ClientGet(
          `registryProducts/${registry.data[0].id}?type=gift`,
          context,
        );
      }
    }
  } catch (error) {
    console.error('Error fetching registry data:', error);
    // Continue without registry data
  }

  return json({
    article: blog.articleByHandle,
    registry: registry?.data || [],
    registryProduct: registryProduct?.data || [],
  });
}

const BlogDetails = () => {
  const {article, registry, registryProduct} = useLoaderData();
  console.log('registry', registry);
  console.log('registryProduct', registryProduct);

  const [firstParagraph, setFirstParagraph] = React.useState('');
  const [sections, setSections] = React.useState([]);

  // Function to extract first paragraph and sections with H2 headings
  const extractContentSections = (htmlContent) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const sections = [];
    let firstParagraph = '';

    // Get all child nodes
    const childNodes = Array.from(tempDiv.childNodes);

    // Find first paragraph (before first H2)
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H2') {
        break;
      }
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
        firstParagraph += node.textContent + ' ';
      }
    }

    // Extract H2 sections
    const h2Elements = tempDiv.querySelectorAll('h2');
    h2Elements.forEach((h2) => {
      const title = h2.textContent;
      let content = '';

      // Get content until next h2 or end
      let nextElement = h2.nextElementSibling;
      while (nextElement && nextElement.tagName !== 'H2') {
        if (nextElement.tagName === 'P') {
          content += nextElement.textContent + ' ';
        }
        nextElement = nextElement.nextElementSibling;
      }

      sections.push({title, content: content.trim()});
    });

    return {firstParagraph: firstParagraph.trim(), sections};
  };

  // Use useEffect to parse content on client side
  React.useEffect(() => {
    if (article.contentHtml) {
      const {firstParagraph: fp, sections: sec} = extractContentSections(
        article.contentHtml,
      );
      setFirstParagraph(fp);
      setSections(sec);
    }
  }, [article.contentHtml]);

  // Fetch registry data
  // React.useEffect(() => {
  //   const fetchRegistryData = async () => {
  //     if (article.metafield?.value) {
  //       try {
  //         const response = await fetch(`http://localhost:3040/api/registries/by-userId/${article.metafield.value}`)
  //         const data = await response.json()
  //       } catch (error) {
  //         console.error('Error fetching data:', error)
  //       }
  //     }
  //   }

  //   fetchRegistryData()
  // }, [article.metafield?.value])

  return (
    <>
      <Header />

      <div className="w-full lg:h-[960px] sm:h-[600px] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#446184] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <p className="text-white text-lg mb-10">WEDDING STORIES</p>
            <Heading
              text={article.title}
              classes={
                'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0 text-white'
              }
              image={lineImghead}
              imageClasses={'max-[1024px]:max-w-[330px]'}
            />
            <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed mx-auto mt-10">
              {firstParagraph}
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full">
          <img
            src={article.image.url}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      <div className="w-full flex flex-row">
        {/* H2 Sections */}
        <div className="w-[70%] px-[80px] py-16">
          {sections.map((section, index) => (
            <div key={index} className="mb-12">
              <div className="mb-6">
                <h2 className="text-4xl font-semibold">{section.title}</h2>
              </div>
              <div className="">
                <p className="text-2xl text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-[30%] px-[80px] py-16">
          <div className="h-[550px] bg-[#FAF9F6] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-xl font-semibold">IT'S ALL IN THE DETAILS</p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-lg font-semibold">PHOTOGRAPHER:</p>
              <p className="text-lg mb-7">Rebecca Wood</p>
              <p className="text-lg font-semibold">WEDDING PLANNER:</p>
              <p className="text-lg mb-7">Duet Events</p>
              <p className="text-lg font-semibold">FLOWERS:</p>
              <p className="text-lg mb-7">Duet Events</p>
              <p className="text-lg font-semibold">VENUE:</p>
              <p className="text-lg">
                Scottish Manor 123 Highlands Rd, Scotland
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-xl font-semibold w-[50%] mx-auto mb-2">
              KRISTY & JASON FAVOURITE GIFTS
            </p>
            <img
              src={BlackLine}
              alt=""
              className="w-[100px] h-[4px] mx-auto mb-10"
            />
                         <div className="flex flex-col">
               {registryProduct.slice(0, 3).map((product, index) => (
                 <div key={index} className="mb-4 p-3 bg-white rounded shadow">
                   {/* <img src={product.image} alt="" /> */}
                   <p className="font-semibold text-sm">Product ID: {product.productId}</p>
                   <p className="text-lg font-bold text-[#446184]">${product.amount}</p>
                   <p className="text-xs text-gray-500">Quantity: {product.quantity}</p>
                 </div>
               ))}
             </div>
          </div>

          <div className="h-[350px] bg-[#FAF9F6] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-xl font-semibold uppercase">
                LOVING {registry[0]?.events?.[0]?.name || 'THEIR'} GIFTS
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-lg mb-7">
                Explore their registry for more inspo and ideas.
              </p>
              <Link to={`/couple/single/${article.metafield?.value || ''}`}>
                <button className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center">
                  VIEW THE REGISTRY
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogDetails;
