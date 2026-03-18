import React, {useState, useEffect, useRef} from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import StickyBarPortal from '~/components/StickyBarPortal';
import lineImghead from '/assets/Images/inspirationLine.png';
import Heading from '~/components/Heading';
import readyMadeImg from '/assets/Images/readyMade.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import ImageAndText from '~/components/ImageAndText';
import lineImg3 from '/assets/Images/line.png';
import teaImg from '/assets/Images/tea.png';
import {json, Link, useLoaderData} from '@remix-run/react';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import arrowDown from '/assets/Images/arrowDown.png';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const BLOGS_QUERY = `#graphql
query GetAllBlogsAndArticlesForInspiration {
  blogs(first: 10, reverse: true) {
    nodes {
      title
      handle
      articles(first: 50) {
        nodes {
          id
          title
          handle
          publishedAt
          contentHtml
          image {
            url
          }
          categoryMetafield: metafield(namespace: "custom", key: "category") {
            value
          }
        }
      }
    }
  }
}
`;

export async function loader({context}) {
  try {
    const {blogs} = await context.storefront.query(BLOGS_QUERY);

    // Allowed blog categories (custom.category metafield values)
    const ALLOWED_BLOG_CATEGORIES = new Set([
      'Real Weddings',
      'The Planning Edit',
      'At Home',
      'Travel & Culture',
    ]);

    // Filter blogs and their articles to only include allowed categories
    const filteredBlogs =
      blogs?.nodes
        ?.map((blog) => {
          const filteredArticles =
            blog.articles?.nodes?.filter((article) =>
              ALLOWED_BLOG_CATEGORIES.has(
                (article?.categoryMetafield?.value || '').trim(),
              ),
            ) || [];

          return {
            ...blog,
            articles: {
              ...blog.articles,
              nodes: filteredArticles,
            },
          };
        })
        .filter((blog) => blog.articles.nodes.length > 0) || [];

    return json({
      blogs: filteredBlogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return json({
      blogs: [],
    });
  }
}

const Inspiration = () => {
  const {blogs} = useLoaderData();

  const [clickedSection, setClickedSection] = React.useState(null);
  const [articlesToShow, setArticlesToShow] = React.useState(12);
  const articlesGridRef = React.useRef(null);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
  const [activeStickyCategory, setActiveStickyCategory] = useState(null);
  const blogCategoriesRef = useRef(null);

  // Show sticky bar when user reaches .blogCategories section and hide when section ends
  useEffect(() => {
    const handleScroll = () => {
      const appClip = document.getElementById('app-clip');
      if (!appClip || !blogCategoriesRef.current) return;

      const scrollTop = appClip.scrollTop;
      const blogCategoriesElement = blogCategoriesRef.current;
      
      // Calculate position relative to app-clip container
      const appClipRect = appClip.getBoundingClientRect();
      const blogCategoriesRect = blogCategoriesElement.getBoundingClientRect();
      
      // Calculate absolute positions within the scroll container
      const blogCategoriesTop = scrollTop + (blogCategoriesRect.top - appClipRect.top);
      const blogCategoriesBottom = blogCategoriesTop + blogCategoriesElement.offsetHeight;
      
      // Show sticky bar when user scrolls past the end of the blogCategories section
      setIsStickyBarVisible(scrollTop >= blogCategoriesBottom);
    };

    const appClip = document.getElementById('app-clip');
    if (appClip) {
      appClip.addEventListener('scroll', handleScroll);
      // Check initial position
      handleScroll();
      return () => appClip.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Update sticky bar active category based on clicked section
  useEffect(() => {
    setActiveStickyCategory(clickedSection);
  }, [clickedSection]);

  // Blog post metafield custom.category choice list values (must match Shopify definition exactly)
  const CATEGORY_VALUES = {
    REAL_WEDDINGS: 'Real Weddings',
    THE_PLANNING_EDIT: 'The Planning Edit',
    AT_HOME: 'At Home',
    TRAVEL_CULTURE: 'Travel & Culture',
  };

  // Flatten all articles from all blogs; safely handle missing articles
  const allArticles = (blogs || []).flatMap(blog => {
    const nodes = blog?.articles?.nodes ?? [];
    return nodes.map(article => ({
      ...article,
      blogHandle: blog.handle,
      category: (article?.categoryMetafield?.value ?? '').trim(),
    }));
  });

  // Map UI section keys to metafield choice list values (custom.category)
  const sectionToCategory = {
    wedding: CATEGORY_VALUES.REAL_WEDDINGS,
    planning: CATEGORY_VALUES.THE_PLANNING_EDIT,
    design: CATEGORY_VALUES.AT_HOME,
    taste: CATEGORY_VALUES.TRAVEL_CULTURE,
  };

  const activeCategory = clickedSection ? sectionToCategory[clickedSection] : null;

  // Filter by selected category (case-insensitive match); when none selected, show all
  const filteredArticles = activeCategory
    ? allArticles.filter(
        (a) => a.category && a.category.toLowerCase() === activeCategory.toLowerCase()
      )
    : allArticles;

  return (
    <div>
      <Header />

      {/* Sticky Category Bar - Rendered outside app-scale via portal */}
      {isStickyBarVisible && (
        <StickyBarPortal>
          <div className="fixed top-[4.823vw] h-[8.729vw] flex items-center justify-center z-50 bg-[#446184] w-full shadow-lg">
            <div className="flex justify-center items-center gap-8 lg:gap-16 px-4 pb-[10px] scale-80">
              {/* Real Weddings */}
              <button
                onClick={() => { 
                  setClickedSection(prev => prev === 'wedding' ? null : 'wedding'); 
                  setArticlesToShow(12); 
                }}
                className={`relative flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div className="h-[6.25vw] flex items-center justify-center">
                  <img src="/assets/Images/real-weddings.png" alt="" className='w-[6.146vw] h-[6.146vw] object-contain' />
                </div>
                <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
                  REAL WEDDINGS
                </span>
                {activeStickyCategory === 'wedding' && (
                  <div className="absolute top-[105%] left-0 w-full flex items-end justify-center">
                    <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] object-contain' />
                  </div>
                )}
              </button>

              {/* The Planning Edit */}
              <button
                onClick={() => { 
                  setClickedSection(prev => prev === 'planning' ? null : 'planning'); 
                  setArticlesToShow(12); 
                }}
                className={`relative flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div className="h-[6.25vw] flex items-center justify-center">
                  <img src="/assets/Images/planning-edit.png" alt="" className='w-[4.688vw] h-[4.688vw] object-contain' />
                </div>
                <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
                  THE PLANNING EDIT
                </span>
                {activeStickyCategory === 'planning' && (
                  <div className="absolute top-[105%] left-0 w-full flex items-end justify-center">
                    <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] object-contain' />
                  </div>
                )}
              </button>

              {/* At Home */}
              <button
                onClick={() => { 
                  setClickedSection(prev => prev === 'design' ? null : 'design'); 
                  setArticlesToShow(12); 
                }}
                className={`relative flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div className="h-[6.25vw] flex items-center justify-center">
                  <img src="/assets/Images/at-home.png" alt="" className='w-full h-full object-contain' />
                </div>
                <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
                  AT HOME
                </span>
                {activeStickyCategory === 'design' && (
                  <div className="absolute top-[105%] left-0 w-full flex items-end justify-center">
                    <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] object-contain' />
                  </div>
                )}
              </button>

              {/* Travel & Culture */}
              <button
                onClick={() => { 
                  setClickedSection(prev => prev === 'taste' ? null : 'taste'); 
                  setArticlesToShow(12); 
                }}
                className={`relative flex flex-col items-center gap-1 cursor-pointer`}
              >
                <div className="h-[6.25vw] flex items-center justify-center">
                  <img src="/assets/Images/travel-culture.png" alt="" className='w-[5.573vw] h-[5.573vw] object-contain' />
                </div>
                <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
                  TRAVEL & CULTURE
                </span>
                {activeStickyCategory === 'taste' && (
                  <div className="absolute top-[105%] left-0 w-full flex items-end justify-center">
                    <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] object-contain' />
                  </div>
                )}
              </button>
            </div>
          </div>
        </StickyBarPortal>
      )}

      {/* Hero Carousel Section */}
      <div className="relative w-full">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet hero-carousel-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active hero-carousel-bullet-active',
          }}
          className="hero-carousel-slider"
          loop={true}
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="relative w-full h-[42vw] max-[1024px]:h-[50vw] max-h-[800px] overflow-hidden">
              <img
                src="/assets/Images/inspiration-carousel-img2.jpg"
                alt="Wedding couple"
                className="w-full h-full object-cover"
              />
              {/* Text Overlay - Left Side */}
              <div className="absolute left-0 top-0 h-full w-full flex items-center">
                <div className="text-white text-center px-8 lg:ml-[11vw] lg:mr-[4.167vw] xl:ml-[11vw] xl:mr-[4.167vw] 2xl:ml-[11vw] 2xl:mr-[4.167vw] max-w-[50%] w-[577px] lg:w-[30.052vw] xl:w-[30.052vw] 2xl:w-[30.052vw]">
                  <h2 className="text-[25px] max-[767px]:text-[20px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] prata leading-tight lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] mb-2 lg:mb-[1.042vw] xl:mb-[1.042vw] 2xl:mb-[1.042vw] font-normal">
                    lorem ipsum title
                  </h2>
                  <p className="text-[12px] max-[767px]:text-[10px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase tracking-[0.1em] lg:tracking-[0.057vw] xl:tracking-[0.057vw] 2xl:tracking-[0.057vw] font-medium mb-2 lg:mb-[1.354vw] xl:mb-[1.354vw] 2xl:mb-[1.354vw]">
                    LOREM IPSUM SUB-TITLE BLURB
                    <br />DOLR SIT AMIT LOREM
                  </p>
                  <Link to="#" className="inline-flex items-center text-[12px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-[0.1em] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw] text-white font-bold hover:opacity-80 transition-opacity">
                    READ MORE <span className="ml-2 text-[10px] lg:text-[0.625vw]">►</span>
                  </Link>
                </div>
              </div>
              {/* Circular Icon with J - Right Side */}
              
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="relative w-full h-[42vw] max-[1024px]:h-[50vw] max-h-[800px] overflow-hidden">
              <img
                src="/assets/Images/inspiration-carousel-img2.jpg"
                alt="Wedding couple"
                className="w-full h-full object-cover"
              />
              {/* Text Overlay - Left Side */}
              <div className="absolute left-0 top-0 h-full w-full flex items-center">
                <div className="text-white text-center px-8 lg:ml-[11vw] lg:mr-[4.167vw] xl:ml-[11vw] xl:mr-[4.167vw] 2xl:ml-[11vw] 2xl:mr-[4.167vw] max-w-[50%] w-[577px] lg:w-[30.052vw] xl:w-[30.052vw] 2xl:w-[30.052vw]">
                  <h2 className="text-[32px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] prata leading-tight lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] mb-2 lg:mb-[1.042vw] xl:mb-[1.042vw] 2xl:mb-[1.042vw] font-normal">
                    lorem ipsum title
                  </h2>
                  <p className="text-[12px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase tracking-[0.1em] lg:tracking-[0.057vw] xl:tracking-[0.057vw] 2xl:tracking-[0.057vw] font-medium mb-2 lg:mb-[1.354vw] xl:mb-[1.354vw] 2xl:mb-[1.354vw]">
                    LOREM IPSUM SUB-TITLE BLURB
                    <br className="max-[1024px]:hidden" />DOLR SIT AMIT LOREM
                  </p>
                  <Link to="#" className="inline-flex items-center text-[12px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-[0.1em] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw] text-white font-bold hover:opacity-80 transition-opacity">
                    READ MORE <span className="ml-2 text-[10px] lg:text-[0.625vw]">►</span>
                  </Link>
                </div>
              </div>
              {/* Circular Icon with J - Right Side */}
              
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div className="relative w-full h-[42vw] max-[1024px]:h-[50vw] max-h-[800px] overflow-hidden">
              <img
                src="/assets/Images/inspiration-carousel-img2.jpg"
                alt="Wedding couple"
                className="w-full h-full object-cover"
              />
              {/* Text Overlay - Left Side */}
              <div className="absolute left-0 top-0 h-full w-full flex items-center">
                <div className="text-white text-center px-8 lg:ml-[11vw] lg:mr-[4.167vw] xl:ml-[11vw] xl:mr-[4.167vw] 2xl:ml-[11vw] 2xl:mr-[4.167vw] max-w-[50%] w-[577px] lg:w-[30.052vw] xl:w-[30.052vw] 2xl:w-[30.052vw]">
                  <h2 className="text-[32px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] prata leading-tight lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] mb-2 lg:mb-[1.042vw] xl:mb-[1.042vw] 2xl:mb-[1.042vw] font-normal">
                    lorem ipsum title
                  </h2>
                  <p className="text-[12px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase tracking-[0.1em] lg:tracking-[0.057vw] xl:tracking-[0.057vw] 2xl:tracking-[0.057vw] font-medium mb-2 lg:mb-[1.354vw] xl:mb-[1.354vw] 2xl:mb-[1.354vw]">
                    LOREM IPSUM SUB-TITLE BLURB
                    <br className="max-[1024px]:hidden" />DOLR SIT AMIT LOREM
                  </p>
                  <Link to="#" className="inline-flex items-center text-[12px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-[0.1em] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw] text-white font-bold hover:opacity-80 transition-opacity">
                    READ MORE <span className="ml-2 text-[10px] lg:text-[0.625vw]">►</span>
                  </Link>
                </div>
              </div>
              {/* Circular Icon with J - Right Side */}
             
            </div>
          </SwiperSlide>

          {/* Slide 4 */}
          <SwiperSlide>
            <div className="relative w-full h-[42vw] max-[1024px]:h-[50vw] max-h-[800px] overflow-hidden">
              <img
                src="/assets/Images/inspiration-carousel-img2.jpg"
                alt="Wedding couple"
                className="w-full h-full object-cover"
              />
              {/* Text Overlay - Left Side */}
              <div className="absolute left-0 top-0 h-full w-full flex items-center">
                <div className="text-white text-center px-8 lg:ml-[11vw] lg:mr-[4.167vw] xl:ml-[11vw] xl:mr-[4.167vw] 2xl:ml-[11vw] 2xl:mr-[4.167vw] max-w-[50%] w-[577px] lg:w-[30.052vw] xl:w-[30.052vw] 2xl:w-[30.052vw]">
                  <h2 className="text-[32px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] prata leading-tight lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] mb-2 lg:mb-[1.042vw] xl:mb-[1.042vw] 2xl:mb-[1.042vw] font-normal">
                    lorem ipsum title
                  </h2>
                  <p className="text-[12px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase tracking-[0.1em] lg:tracking-[0.057vw] xl:tracking-[0.057vw] 2xl:tracking-[0.057vw] font-medium mb-2 lg:mb-[1.354vw] xl:mb-[1.354vw] 2xl:mb-[1.354vw]">
                    LOREM IPSUM SUB-TITLE BLURB
                    <br className="max-[1024px]:hidden" />DOLR SIT AMIT LOREM
                  </p>
                  <Link to="#" className="inline-flex items-center text-[12px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-[0.1em] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw] text-white font-bold hover:opacity-80 transition-opacity">
                    READ MORE <span className="ml-2 text-[10px] lg:text-[0.625vw]">►</span>
                  </Link>
                </div>
              </div>
              {/* Circular Icon with J - Right Side */}
             
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div ref={blogCategoriesRef} className="blogCategories mx-auto w-full">
        <div className="h-[10.729vw] max-[767px]:h-auto max-[767px]:py-3 max-[767px]:flex-wrap flex items-center justify-center z-50 bg-[#446184] w-full shadow-lg gap-8 lg:gap-16 px-4">
          <div
            className="relative cursor-pointer"
            onClick={() => { 
              setClickedSection(prev => prev === 'wedding' ? null : 'wedding'); 
              setArticlesToShow(12); 
            }}
          >
            <div className="h-[6.25vw] max-[767px]:h-[50px] flex items-center justify-center">
              <img src="/assets/Images/real-weddings.png" alt="" className='w-[6.146vw] max-[767px]:w-[50px] h-[6.146vw] max-[767px]:h-[50px] object-contain' />
            </div>
            <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
              REAL WEDDINGS
            </span>
            {clickedSection === 'wedding' && (
                <div className="absolute top-[102%] left-0 w-full flex items-end justify-center">
                  <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] max-[767px]:w-[25px] max-[767px]:h-[25px] object-contain' />
                </div>
            )}
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { 
              setClickedSection(prev => prev === 'planning' ? null : 'planning'); 
              setArticlesToShow(12); 
            }}
          >
            <div className="h-[6.25vw] max-[767px]:h-[50px] flex items-center justify-center">
              <img src="/assets/Images/planning-edit.png" alt="" className='w-[4.688vw] max-[767px]:w-[40px] h-[4.688vw] max-[767px]:h-[40px] object-contain' />
            </div>
            <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
              THE PLANNING EDIT
            </span>
            {clickedSection === 'planning' && (
              <div className="absolute top-[102%] left-0 w-full flex items-end justify-center">
                <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] max-[767px]:w-[25px] max-[767px]:h-[25px] object-contain' />
              </div>
            )}
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { 
              setClickedSection(prev => prev === 'design' ? null : 'design'); 
              setArticlesToShow(12); 
            }}
          >
            <div className="h-[6.25vw] max-[767px]:h-[50px] flex items-center justify-center">
              <img src="/assets/Images/at-home.png" alt="" className='w-full h-full object-contain' />
            </div>
            <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
              AT HOME
            </span>
            {clickedSection === 'design' && (
              <div className="absolute top-[102%] left-0 w-full flex items-end justify-center">
                <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] max-[767px]:w-[25px] max-[767px]:h-[25px] object-contain' />
              </div>
            )}
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { 
              setClickedSection(prev => prev === 'taste' ? null : 'taste'); 
              setArticlesToShow(12); 
            }}
          >
            <div className="h-[6.25vw] max-[767px]:h-[50px] flex items-center justify-center">
              <img src="/assets/Images/travel-culture.png" alt="" className='w-[5.573vw] max-[767px]:w-[40px] h-[5.573vw] max-[767px]:h-[40px] object-contain' />
            </div>
            <span className="text-white text-xs lg:[0.833vw] xl:[0.833vw] 2xl:[0.833vw] font-semibold uppercase tracking-[0.067vw]">
              TRAVEL & CULTURE
            </span>
            {clickedSection === 'taste' && (
                <div className="absolute top-[102%] left-0 w-full flex items-end justify-center">
                  <img src="/assets/Images/active-icon.png" alt="" className='w-[2.917vw] h-[2.917vw] max-[767px]:w-[25px] max-[767px]:h-[25px] object-contain' />
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-16 mx-auto">
        <h3 className="text-center text-[1.458vw] font-[500]">
          {clickedSection === 'wedding' ? 'WEDDING STORIES' : 
           clickedSection === 'planning' ? 'REGISTRY & PLANNING TIPS' :
           clickedSection === 'design' ? 'DESIGN NOTES' :
           clickedSection === 'taste' ? 'TASTE & TRAVEL' :
           ''}
        </h3>
        <p className="text-center lg:text-[1.25vw] lg:leading-[1.875vw] text-xl lg:w-[50%] mx-auto mt-5">
          {clickedSection === 'wedding' ? 
            "Real couples, real style. Go behind the scenes of some of our favourite celebrations and get inspired by how real couples infused style and heart into their day." :
            clickedSection === 'planning' ?
            "Expert tips and advice to help you plan the perfect registry and wedding celebration." :
            clickedSection === 'design' ?
            "Explore design inspiration and styling tips for your special day." :
            clickedSection === 'taste' ?
            "Culinary inspiration and travel ideas for your wedding journey." :
            ""
          }
        </p>

        {/* Render filtered articles grid for any selected category. If none, show coming soon. */}
        {filteredArticles.length > 0 ? (
          <>
            <div ref={articlesGridRef} className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4 mt-16 px-[7.375vw]">
              {filteredArticles.slice(0, articlesToShow).map(article => {
                const cleanTitle = article.title.replace(/<[^>]*>/g, '');
                const maxTitleLength = 50;
                const isTitleLong = cleanTitle.length > maxTitleLength;
                const displayedTitle = isTitleLong
                  ? cleanTitle.slice(0, maxTitleLength) + '...'
                  : cleanTitle;
                return (
                  <div key={article.id} className="mb-[5.156vw]">
                    <div className="w-full">
                      {article.image?.url ? (
                        <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                        <img src={article.image.url} alt="" className='w-full aspect-square object-cover'/>
                        </Link>
                      ) : (
                        <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                        <img src="/assets/Images/couple-logo.png" alt="" className='w-full aspect-square object-contain'/>
                        </Link>
                      )}
                      <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                      <h4 className="text-xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] font-semibold mt-[1.667vw] mb-[14px] lg:mb-[0.729vw] xl:mb-[0.729vw] 2xl:mb-[0.729vw] text-ellipsis overflow-hidden whitespace-nowrap">
                        {displayedTitle}
                      </h4>
                      </Link>
                      <p className="text-sm mt-0 mb-[1.042vw] ivyora italic lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.4vw] xl:leading-[1.4vw] 2xl:leading-[1.4vw] lg:tracking-[0.052vw] xl:tracking-[0.052vw] 2xl:tracking-[0.052vw] tracking-[1px] font-normal">
                        {article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 80)}
                        ...
                      </p>
                      <div className="flex items-center justify-start">
                        <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                          <p className="font-bold flex items-center lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase gap-2 ">
                            Read More
                            <img src={readMoreIcon} alt="" className='w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw] xl:w-[0.833vw] xl:h-[0.833vw] 2xl:w-[0.833vw] 2xl:h-[0.833vw] relative -top-[2px]' />
                          </p>
                    </Link>
            </div>
            </div>
            </div>
                );
              })}
            </div>

        <div className="">
          <div className="w-full"> </div>
          <div className="w-full flex flex-col items-center">
            <p className="text-center text-[18px] font-[500] tracking-[0.8px] leading-[18px] my-[2.083vw]">
                  LOADING {Math.min(articlesToShow, filteredArticles.length)} of {filteredArticles.length}
            </p>

                {filteredArticles.length > 12 && articlesToShow < filteredArticles.length && (
            <WhiteThemeButton
              Text="View more" 
                    onClick={() => setArticlesToShow(prev => Math.min(prev + 12, filteredArticles.length))}
                  />
                )}

                {articlesToShow > 12 && (
                  <button 
                    className="border-b mx-auto cursor-pointer mb-[9.167vw] uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] hover:bg-gray-100"
                    onClick={() => {
                      setArticlesToShow(12);
                      if (articlesGridRef.current) {
                        articlesGridRef.current.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                  >
              Back to Top
            </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {!clickedSection && allArticles.length === 0
                ? 'No articles yet. Add blog posts in your Shopify admin to see them here.'
                : clickedSection === 'planning'
                  ? 'Planning tips coming soon...'
                  : clickedSection === 'design'
                    ? 'Design notes coming soon...'
                    : clickedSection === 'taste'
                      ? 'Taste & travel content coming soon...'
                      : clickedSection === 'wedding'
                        ? 'Real weddings content coming soon...'
                        : 'Content coming soon...'}
            </p>
          </div>
        )}
    </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="ready?"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
          buttontext={'GET STARTED'}
          buttontype={'Color'}
          buttonLink={'/register'} 
        />
      </div>

      <Footer />
    </div>
  );
};

export default Inspiration;
