import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {
  json,
  Link,
  useLoaderData,
  useFetcher,
  useNavigate,
} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import lineImghead from '/assets/Images/WhiteLine.png';
import BlackLine from '/assets/Images/line.png';
import regLogo from '/assets/Images/reglogo.png';
import Heading from '~/components/Heading';
import {extractShopifyId} from '~/utils/helpers.js';

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
        userIdMetafield: metafield(namespace: "custom", key: "userId") {
          value
        }
        photographerMetafield: metafield(namespace: "custom", key: "photographer") {
          value
        }
        weddingPlannerMetafield: metafield(namespace: "custom", key: "wedding_planner") {
          value
        }
        flowersMetafield: metafield(namespace: "custom", key: "flowers") {
          value
        }
        venueMetafield: metafield(namespace: "custom", key: "venue") {
          value
        }
        productsMetafield: metafield(namespace: "custom", key: "products") {
          value
        }
        coupleMetafield: metafield(namespace: "custom", key: "couple_name") {
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

  // Get user session if available (optional for non-logged in users)
  const user = context?.session?.get('@User');
  let registry = null;
  let registryProduct = null;

  // Extract metafields into a more usable format
  const metafields = {
    userId: blog.articleByHandle.userIdMetafield?.value,
    photographer: blog.articleByHandle.photographerMetafield?.value,
    wedding_planner: blog.articleByHandle.weddingPlannerMetafield?.value,
    flowers: blog.articleByHandle.flowersMetafield?.value,
    venue: blog.articleByHandle.venueMetafield?.value,
    couple_name: blog.articleByHandle.coupleMetafield?.value,
  };

  // Parse products from metafield (assuming it's stored as JSON string)
  let productIds = [];
  try {
    if (blog.articleByHandle.productsMetafield?.value) {
      const parsedIds = JSON.parse(
        blog.articleByHandle.productsMetafield.value,
      );
      // Ensure we have an array of valid Shopify GIDs
      if (Array.isArray(parsedIds)) {
        productIds = parsedIds.filter(
          (id) =>
            typeof id === 'string' && id.startsWith('gid://shopify/Product/'),
        );
      }
    }
  } catch (error) {
    console.error('Error parsing products metafield:', error);
    productIds = [];
  }

  // Fetch product details from Shopify using the IDs
  let products = [];
  if (productIds && productIds.length > 0) {
    try {
      const productQueries = productIds
        .map(
          (id, index) => `
        product${index}: product(id: "${id}") {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
        )
        .join('\n');

      const PRODUCTS_QUERY = `#graphql
        query GetProducts {
          ${productQueries}
        }
      `;

      console.log('Product IDs to fetch:', productIds);
      console.log('Generated query:', PRODUCTS_QUERY);

      const result = await context.storefront.query(PRODUCTS_QUERY);
      console.log('Query result:', result);

      // Convert the data object to an array, with proper null checks
      if (result) {
        // The result is directly the data object, not wrapped in a 'data' property
        products = Object.values(result).filter((product) => product !== null);
        console.log('Processed products:', products);
      } else {
        console.log('No product data returned from query');
        products = [];
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      products = [];
    }
  }

  try {
    // Fetch registry for the logged-in user (for adding products to their registry)
    if (user && user.user && user.user.id) {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
      console.log('User registry', registry?.data?.[0]?.id);

      if (registry?.data?.[0]?.id) {
        registryProduct = await context.ClientGet(
          `registryProducts/${registry.data[0].id}?type=gift`,
          context,
        );
      }
    }

    // Also fetch the article author's registry for display purposes
    let authorRegistry = null;
    if (metafields.userId) {
      authorRegistry = await context.ClientGet(
        `registries/by-userId/${metafields.userId}`,
        context,
      );
      console.log('Author registry', authorRegistry?.data?.[0]?.id);
    }
  } catch (error) {
    console.error('Error fetching registry data:', error);
    // Continue without registry data
  }

  return json({
    article: blog.articleByHandle,
    metafields,
    products,
    registry: registry?.data || [],
    registryProduct: registryProduct?.data || [],
    user: user || null,
  });
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

const BlogDetails = () => {
  const {article, metafields, products, registry, registryProduct, user} =
    useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState('success');

  console.log('article', article);
  console.log('metafields', metafields);
  console.log('products', products);
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

  const handleAddToRegistry = (product, quantity) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        navigate('/login');
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry[0] || !registry[0].id) {
        setAlertMessage('Registry not found. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const firstVariant = product?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        setAlertMessage('Product variant not found.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry[0].id),
        productTypeId: 1,
        quantity: quantity,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

      // Show success alert
      setAlertMessage(`${product.title} has been added to your registry!`);
      setAlertType('success');
      setShowAlert(true);

      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      setAlertMessage('Failed to add to registry. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    }
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
              <p className="text-lg mb-7">
                {metafields.photographer || 'Not specified'}
              </p>
              <p className="text-lg font-semibold">WEDDING PLANNER:</p>
              <p className="text-lg mb-7">
                {metafields.wedding_planner || 'Not specified'}
              </p>
              <p className="text-lg font-semibold">FLOWERS:</p>
              <p className="text-lg mb-7">
                {metafields.flowers || 'Not specified'}
              </p>
              <p className="text-lg font-semibold">VENUE:</p>
              <p className="text-lg">{metafields.venue || 'Not specified'}</p>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-xl font-semibold w-[50%] mx-auto mb-2 uppercase">
              {metafields.couple_name || 'THEIR'} FAVOURITE GIFTS
            </p>
            <img
              src={BlackLine}
              alt=""
              className="w-[100px] h-[4px] mx-auto mb-10"
            />
            <div className="flex flex-col">
              {products.slice(0, 3).map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  index={index}
                  onAddToRegistry={(quantity) =>
                    handleAddToRegistry(product, quantity)
                  }
                />
              ))}
            </div>
          </div>

          <div className="h-[370px] w-[400px] bg-[#FAF9F6] relative mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-xl font-semibold uppercase">
                LOVING {metafields.couple_name || 'THEIR'} GIFTS
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-lg mb-7">
                Explore their registry for more inspo and ideas.
              </p>
              <Link to={`/couple/single/${metafields.userId || ''}`}>
                <button className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center">
                  VIEW THE REGISTRY
                </button>
              </Link>
            </div>
          </div>

          <div className="h-[620px] w-[400px] bg-[#446184] relative mt-10 mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <img
                src={regLogo}
                alt=""
                className="w-[100px] h-[100px] mx-auto mb-10"
              />
              <h2 className="text-white text-[22px] font-semibold">
                WOULD YOU LIKE YOUR SPECIAL DAY TO BE FEATURED?
              </h2>
              <p className="text-white text-[18px] my-10">
                Whether it’s a single photo for Instagram or a longer story for
                our blog, we love seeing how couples celebrated their wedding. 
              </p>
              <Link to={`/couple/single/${metafields.userId || ''}`}>
                <button className="h-[70px] w-[280px] text-[17px] max-[1601px]:text-[14px] text-black bg-[#F5F2ED] border border-black hover:opacity-90 uppercase font-[800] max-[1601px]:w-[200px] text-center">
                  SUBMIT HERE
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Alert Component */}
      {showAlert && (
        <div
          className={`fixed top-4 right-4 ${
            alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
        >
          <div className="flex items-center">
            {alertType === 'success' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {alertType === 'error' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

const ProductCard = ({product, index, onAddToRegistry}) => {
  const [quantity, setQuantity] = React.useState(1);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <>
      <p className="text-[60px] text-center prata">{index + 1}.</p>
      <div className="p-3 bg-white mx-auto relative group h-[460px]">
        {/* Product Image and Info */}
        <div className="relative">
          {product.images?.edges?.[0]?.node?.url && (
            <img
              src={product.images.edges[0].node.url}
              alt={
                product.images.edges[0].node.altText ||
                product.title ||
                'Product'
              }
              className="w-[320px] h-[320px] object-cover rounded mb-2"
            />
          )}
          <p className="font-semibold text-[22px]">
            {product.title || `Product ${index + 1}`}
          </p>
          <p className="text-[24px]">
            ${product.priceRange?.minVariantPrice?.amount || '0.00'}{' '}
            {product.priceRange?.minVariantPrice?.currencyCode || ''}
          </p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute h-[680px] w-[400px] left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 z-40 bg-[#FAF9F6] py-[2vw] px-[2.24vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center">
          <div>
            {product.images?.edges?.[0]?.node?.url && (
              <img
                src={product.images.edges[0].node.url}
                alt={
                  product.images.edges[0].node.altText ||
                  product.title ||
                  'Product'
                }
                className="w-full h-[200px] lg:h-[13.542vw] mx-auto object-cover mb-[20px] rounded"
              />
            )}
            <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
              PRODUCT
            </h4>
            <h3 className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0">
              {product.title || `Product ${index + 1}`}
            </h3>
            <p className="text-[20px] lg:text-[1.25vw] leading-[20px] lg:leading-[1.25vw] mt-[22px] text-left">
              ${product.priceRange?.minVariantPrice?.amount || '0.00'}{' '}
              {product.priceRange?.minVariantPrice?.currencyCode || ''}
            </p>
          </div>

          <div className="flex flex-col w-full items-center text-xs">
            {/* Quantity Selector and View Product Button */}
            <div className="flex items-center justify-around w-full mb-4">
              <p className="text-[18px] font-[500] uppercase text-left mb-1">
                QTY
              </p>
              {/* Quantity Selector */}
              <div className="flex flex-col items-center">
                <button
                  onClick={incrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-[16px] h-[16px] rotate-180"
                    alt=""
                  />
                </button>

                <input
                  value={quantity}
                  className="w-16 lg:text-[1.458vw] lg:leading-[1.25vw] lg:h-[1.563vw] relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-28px"
                  readOnly
                />

                <button
                  onClick={decrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-[16px] h-[16px]"
                    alt=""
                  />
                </button>
              </div>

              {/* Add to Registry Button */}
              <button
                onClick={() => onAddToRegistry(quantity)}
                className="bg-[#446184] text-white text-[14px] leading-[20px] font-bold py-4 px-6 lg:px-0 lg:py-0 lg:text-[0.729vw] lg:leading-[1.042vw] lg:w-[190px] lg:h-[65px]"
              >
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;

<style jsx>{`
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  .animate-fade-in-out {
    animation: fadeInOut 3s ease-in-out;
  }
`}</style>;
