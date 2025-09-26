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
import lineImghead from '/assets/Images/inspirationLine.png';
import BlackLine from '/assets/Images/line.png';
import regLogo from '/assets/Images/reglogo.png';
import Heading from '~/components/Heading';
import {extractShopifyId} from '~/utils/helpers.js';
import heart from '/assets/Images/heart.png';
import lineImgWhiteHead from '/assets/Images/WhiteLine.png';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/tea.png';
import lineImg3 from '/assets/Images/line.png';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import nextitem from '/assets/Images/next.png';
import 'swiper/css';
import 'swiper/css/navigation';
import BlogArticle from '~/components/BlogArticle';

const BLOGS_QUERY = `#graphql
query GetAllBlogsAndArticlesForInspiration {
  blogs(first: 10) {
    nodes {
      title
      handle
      articles(first: 20) {
        nodes {
          id
          title
          handle
          publishedAt
          contentHtml
          image {
            url
          }
        }
      }
    }
  }
}
`;

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
          paraMetafield: metafield(namespace: "custom", key: "first_para") {
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
    first_para: blog.articleByHandle.paraMetafield?.value,
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


  const {blogs} = await context.storefront.query(BLOGS_QUERY);

  return json({
    article: blog.articleByHandle,
    metafields,
    products,
    registry: registry?.data || [],
    registryProduct: registryProduct?.data || [],
    user: user || null,
    blogs: blogs?.nodes || [],
    currentArticleHandle: articleHandle,
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
  const {article, metafields, products, registry, registryProduct, user, blogs, currentArticleHandle} =
    useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState('success');

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


  return (
    <>
      <Header />

      <div className="w-full lg:h-[960px] sm:h-[600px] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#446184] relative">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <p className="text-white text-[20px] font-bold mb-10">WEDDING STORIES</p>
            <Heading
              text={article.title}
              classes={
                'prata text-[56px] font-normal text-center max-[1024px]:m-0 text-white'
              }
              image={lineImgWhiteHead}
              imageClasses={'max-[1024px]:max-w-[330px]'}
            />
            <p className="ivyora italic text-[32px] text-white leading-relaxed mx-auto mt-10">
              {metafields.first_para}
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
        {/* Full Content Display */}
        <div className="w-[72%] px-[80px] py-16">
          <BlogArticle article={article} processedContent={article.contentHtml} />
        </div>

        <div className="w-[28%] h-[709px] px-[80px] py-16">
          <div className="h-[550px] bg-[#FAF9F6] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-[24px] bastardogrotesk font-semibold">IT'S ALL IN THE DETAILS</p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              {metafields.photographer && (
                <>
              <p className="text-[20px] bastardogrotesk font-semibold">PHOTOGRAPHER:</p>
                  <p className="text-[20px] font-normal mb-7">{metafields.photographer}</p>
                </>
              )}
              {metafields.wedding_planner && (
                <>
              <p className="text-[20px] bastardogrotesk font-semibold">WEDDING PLANNER:</p>
                  <p className="text-[20px] font-normal mb-7">{metafields.wedding_planner}</p>
                </>
              )}

              {metafields.flowers && (
                <>
              <p className="text-[20px] bastardogrotesk font-semibold">FLOWERS:</p>
                  <p className="text-[20px] font-normal mb-7">{metafields.flowers}</p>
                </>
              )}
              {metafields.venue && (
                <>
              <p className="text-[20px] bastardogrotesk font-semibold">VENUE:</p>
                  <p className="text-[20px] font-normal">{metafields.venue}</p>
                </>
              )}
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-[24px] font-semibold mx-auto mb-2 uppercase">
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

          <div className="h-[370px] w-full bg-[#FAF9F6] relative mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-[20px] font-bold uppercase">
                LOVING {metafields.couple_name || 'THEIR'} GIFTS
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-[18px] font-normal mb-7">
                Explore their registry for more inspo and ideas.
              </p>
              <Link to={`/couple/single/${metafields.userId || ''}`}>
                <button className="w-[286px] h-[68px] text-[14px] font-bold bg-[#446184] hover:opacity-90 uppercase text-white text-center">
                  VIEW THE REGISTRY
                </button>
              </Link>
            </div>
          </div>

          <div className="h-[620px] w-full bg-[#446184] relative mt-10 mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <img
                src={regLogo}
                alt=""
                className="w-[104px] mx-auto mb-10"
              />
              <h2 className="text-white text-[22px] font-semibold">
                WOULD YOU LIKE YOUR SPECIAL DAY TO BE FEATURED?
              </h2>
              <p className="text-white text-[18px] my-10">
                Whether it’s a single photo for Instagram or a longer story for
                our blog, we love seeing how couples celebrated their wedding. 
              </p>
              <Link to={'/submit-wedding'}>
                <button className="h-[68px] w-[286px] text-[14px] font-bold max-[1601px]:text-[14px] text-black bg-[#F5F2ED] border border-black hover:opacity-90 uppercase max-[1601px]:w-[200px] text-center">
                  SUBMIT HERE
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-16'>
        <img src={heart} alt="" className='mx-auto w-[250px]'/>

        <Heading
          text="more wedding stories"
          classes={'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 mt-10'}
          image={lineImghead}
          imageClasses={'max-w-[430px]'}
        />

        <div className="relative items-start mt-16">
          <div className="lg:w-[77.969vw] max-w-[85%] mx-auto">
            <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180" />
              <span className="-rotate-90 text-black lg:text-[1.146vw] block tracking-wider max-[1024px]:hidden">
                more
              </span>
            </div>

            <Swiper
              spaceBetween={15}
              slidesPerView={4}
              loop={true}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className="px-[50px]"
              breakpoints={{
                345: {
                  spaceBetween: 10,
                  slidesPerView: 1,
                  centeredSlides: false,
                },
                475: {
                  spaceBetween: 15,
                  slidesPerView: 2,
                  centeredSlides: false,
                },
                768: {
                  spaceBetween: 20,
                  slidesPerView: 3,
                  centeredSlides: false,
                },
                1024: {
                  spaceBetween: 20,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
                1366: {
                  spaceBetween: 25,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
                1600: {
                  spaceBetween: 30,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
              }}
            >
              {blogs.flatMap(blog => 
                blog.articles.nodes
                  .filter(article => article.handle !== currentArticleHandle) // Exclude current article
                  .map(article => (
                    <SwiperSlide key={article.id}>
                      <div className="w-full">
                        <img src={article.image.url} alt="" className='w-[372px] h-[388px] object-cover'/>
                        <h4 className="text-xl lg:text-[22px] lg:leading-[1.458vw] font-semibold mt-3">
                          {article.title}
                        </h4>
                        <p className="text-sm mt-2 mb-3 ivyora italic lg:text-[20px] lg:leading-[1.1vw] font-normal">
                          {article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 95)}
                          ...
                        </p>
                        <div className="flex items-center justify-start">
                          <Link to={`/blogs/${blog.handle}/${article.handle}`}>
                            <p className="font-bold flex items-center justify-center lg:text-[18px] uppercase gap-2">
                              Read More
                              <img src={readMoreIcon} className='w-[16px] h-[16px] pl-0.5' alt="" />
                            </p>
                          </Link>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                ).slice(0, 12)}
            </Swiper>
            
            <div className="swiper-button-next-prod absolute top-0 right-[0] max-[1601px]:right-0 cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
              <span className="rotate-90 text-black block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
                more
              </span>
              <img src={nextitem} className="" alt="" />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-16">
            <WhiteThemeButton Text="Back To All Stories" link="/inspiration" />
          </div>

          <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="are you ready?"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
          buttontext={'GET STARTED'}
          buttontype={'Color'}
          buttonLink={'/register'}
        />
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
      <p className="text-[72px] text-center prata">{index + 1}.</p>
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
              className="w-[320px] h-[320px] object-cover rounded mb-2 mx-auto"
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
                className="w-[300px] h-[300px] lg:h-[13.542vw] mx-auto object-cover mb-[20px] rounded"
              />
            )}
            <h4 className="text-[16px] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
              PRODUCT
            </h4>
            <h3 className="text-[22px] lg:leading-[1.146vw] font-semibold uppercase text-left leading-[22px] m-0">
              {product.title || `Product ${index + 1}`}
            </h3>
            <p className="text-[24px] font-normal leading-[20px] lg:leading-[1.25vw] mt-[22px] text-left">
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
                  className="w-16 text-[28px] font-normal relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-28px"
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
