import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/swiper-bundle.css';

import {Navigation, Pagination} from 'swiper/modules';
import {Link} from '@remix-run/react';
import { useState, useEffect } from 'react';

const Testimonialslider = ({ blogs = [] }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Helper function to convert vw to pixels based on a specific width
  const vwToPx = (vw, width = windowWidth) => {
    return (width * vw) / 100;
  };

  // Calculate spaceBetween based on viewport width
  const getSpaceBetween = () => {
    if (windowWidth < 768) return 0;
    if (windowWidth < 1600) return 40;
    return vwToPx(5); // 5vw for screens 1600px and above
  };
  
  // Flatten all articles from all blogs with proper error handling
  const allArticles = blogs?.flatMap(blog => 
    blog?.articles?.nodes?.map(article => ({
      ...article,
      blogHandle: blog.handle,
      category: (article?.categoryMetafield?.value || '').toLowerCase().trim(),
      venue: article?.venueMetafield?.value || '',
    })) || []
  ) || [];

  return (
    <div className="testimonialSlider pt-[38px] pb-5 lg:pt-20 lg:pb-0">
      <Swiper
        key={`swiper-${Math.floor(windowWidth / 50)}`} // Force re-render on width changes to update vw calculations
        loop={true}
        slidesPerView={1.5}
        spaceBetween={getSpaceBetween()}
        centeredSlides={true}
        pagination={{clickable: true}}
        modules={[Pagination]}
        className=""
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1.7,
            spaceBetween: 40,
          },
          1600: {
            slidesPerView: 1.7,
            // spaceBetween handled by base prop (5vw)
          },
          2000: {
            slidesPerView: 1.7,
            // spaceBetween handled by base prop (5vw)
          },
        }}
      >
        {allArticles.length > 0 ? allArticles.slice(0, 4).map((article, index) => {
          const cleanTitle = article?.title?.replace(/<[^>]*>/g, '') || 'Untitled Article';
          const cleanContent = article?.contentHtml?.replace(/<[^>]*>/g, '') || '';
          const excerpt = cleanContent.slice(0, 300) + (cleanContent.length > 300 ? '...' : '');
          
          return (
            <SwiperSlide key={article.id} className='!lg:w-[70.96vw] xl:w-[70.96vw] 2xl:w-[70.96vw]'>
              <div className="flex p-0 max-[1024px]:p-0 bg-white registrytagwhite relative max-[1024px]:h-[450px]">
                <img
                  src={article.image?.url || "/assets/Images/couple-logo.png"}
                  alt={article.image?.altText || cleanTitle}
                  className="max[1024px]:w-full h-full relative object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[450px] lg:w-[36.45vw] xl:w-[36.45vw] 2xl:w-[36.45vw] lg:h-[44.92vw] xl:h-[44.92vw] 2xl:h-[44.92vw] rounded-none"
                />
                <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[36.45vw] xl:w-[36.45vw] 2xl:w-[36.45vw] lg:h-[44.92vw] xl:h-[44.92vw] 2xl:h-[44.92vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
                  <p className="text-xl lg:text-[1.1vw] lg:leading-[1.9vw] font-normal tracking-wider leading-[38px] max-[1024px]:text-[15px] max-[1024px]:mt-0 max-[1024px]:leading-normal max-[1024px]:line-clamp-15">
                    {excerpt}
                  </p>
                  <Link to={`/blogs/${article.blogHandle || 'blog'}/${article.handle || 'article'}`}>
                    <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-[16px] flex items-center gap-2 text-white font-normal mt-[2vw]">
                      <span className="border-white border-b-2 pb-[3px] max-[1024px]:hidden">READ ON</span>
                      <img
                        src="/assets/Images/arrow.png"
                        className=" -mt-1 lg:w-[0.834vw] lg:h-[0.834vw] max-[1024px]:hidden max-[1024px]:w-[12px] max-[1024px]:h-[12px]"
                        alt="next"
                        
                      />
                    </h3>
                  </Link>
                  <div className="flex flex-col items-end">
                    <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                      {cleanTitle}
                    </h3>
                    <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                      {article.venue || 'Venue TBD'}
                    </h4>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        }) : (
          <SwiperSlide className='lg:w-[70.96vw] xl:w-[70.96vw] 2xl:w-[70.96vw]'>
            <div className="flex p-0 max-[1024px]:p-0 bg-white registrytagwhite relative max-[1024px]:h-[700px]">
              <img
                src="/assets/Images/couple-logo.png"
                alt="No articles available"
                className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[450px] lg:w-[52vw] xl:w-[52vw] 2xl:w-[52vw] lg:h-[36.458vw] xl:h-[36.458vw] 2xl:h-[36.458vw] rounded-none"
              />
              <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[36.45vw] xl:w-[36.45vw] 2xl:w-[36.45vw] lg:h-[44.92vw] xl:h-[44.92vw] 2xl:h-[44.92vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
                <p className="text-xl lg:text-[1.1vw] lg:leading-[1.9vw] font-normal tracking-wider leading-[38px] max-[1024px]:text-[15px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                  We're working on bringing you amazing blog content. Check back soon for inspiring stories and helpful tips!
                </p>
                <div className="flex flex-col items-end">
                  <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                    Coming Soon
                  </h3>
                  <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                    Stay Tuned
                  </h4>
                </div>
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default Testimonialslider;
