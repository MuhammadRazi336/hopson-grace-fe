import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/swiper-bundle.css';

import {Navigation, Pagination} from 'swiper/modules';
import {Link} from '@remix-run/react';

const Testimonialslider = ({ blogs = [] }) => {
  
  // Flatten all articles from all blogs with proper error handling
  const allArticles = blogs?.flatMap(blog => 
    blog?.articles?.nodes?.map(article => ({
      ...article,
      blogHandle: blog.handle,
      category: (article?.categoryMetafield?.value || '').toLowerCase().trim(),
    })) || []
  ) || [];

  return (
    <div className="testimonialSlider pt-[38px] pb-5 lg:pt-20 lg:pb-0">
      <Swiper
        loop={true}
        slidesPerView={1.5}
        spaceBetween={40}
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
            slidesPerView: 1.5,
            spaceBetween: 40,
          },
          2000: {
            slidesPerView: 1.5,
            spaceBetween: 40,
          },
        }}
      >
        {allArticles.length > 0 ? allArticles.slice(0, 4).map((article, index) => {
          const cleanTitle = article?.title?.replace(/<[^>]*>/g, '') || 'Untitled Article';
          const cleanContent = article?.contentHtml?.replace(/<[^>]*>/g, '') || '';
          const excerpt = cleanContent.slice(0, 200) + (cleanContent.length > 200 ? '...' : '');
          
          return (
            <SwiperSlide key={article.id}>
              <div className="flex p-0 max-[1024px]:p-0 bg-white registrytagwhite relative max-[1024px]:h-[700px]">
                <img
                  src={article.image?.url || "/assets/Images/couple-logo.png"}
                  alt={article.image?.altText || cleanTitle}
                  className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[450px] lg:w-[44.417vw] xl:w-[44.417vw] 2xl:w-[44.417vw] lg:h-[36.458vw] xl:h-[36.458vw] 2xl:h-[36.458vw] rounded-none"
                />
                <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
                  <h3 className="text-xl lg:text-[1.25vw] lg:leading-[1.5vw] font-bold mb-3 max-[1024px]:text-[16px] max-[1024px]:leading-normal">
                    {cleanTitle}
                  </h3>
                  <p className="text-lg lg:text-[1vw] lg:leading-[1.8vw] font-normal tracking-wider leading-[35px] max-[1024px]:text-[14px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                    {excerpt}
                  </p>
                  <Link to={`/blogs/${article.blogHandle || 'blog'}/${article.handle || 'article'}`}>
                    <h3 className="lg:text-[0.938vw] lg:leading-[0.938vw] text-[16px] flex items-center gap-2 text-white font-normal mt-[2vw]">
                      <span className="border-white border-b-2 pb-[3px] max-[1024px]:hidden">READ MORE</span>
                      <img
                        src="/assets/Images/next.png"
                        className="invert-100 -mt-1 lg:w-[0.834vw] lg:h-[0.834vw] max-[1024px]:hidden max-[1024px]:w-[12px] max-[1024px]:h-[12px]"
                        alt="next"
                        
                      />
                    </h3>
                  </Link>
                  <div className="flex flex-col items-end">
                    <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                      {(article.category) && (article.category == 'wedding') ? 'WEDDING STORIES' : (article.category) && (article.category == 'ready') ? 'READY-MADE REGISTRIES' : (article.category) && (article.category == 'planning') ? 'REGISTRY & PLANNING TIPS' : (article.category) && (article.category == 'design') ? 'DESIGN NOTES' : (article.category) && (article.category == 'taste') ? 'TASTE & TRAVEL' : 'ARTICLE'}
                    </h3>
                    <h4 className="text-right ivyora text-xl lg:text-[1.875vw] lg:leading-[2.5vw] font-normal m-0 max-[1024px]:hidden">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'Recent'}
                    </h4>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        }) : (
          <SwiperSlide>
            <div className="flex p-0 max-[1024px]:p-0 bg-white registrytagwhite relative max-[1024px]:h-[700px]">
              <img
                src="/assets/Images/couple-logo.png"
                alt="No articles available"
                className="max[1024px]:w-full h-full object-cover max-[1024px]:w-[45vw] max-[1024px]:h-[450px] lg:w-[35.417vw] lg:h-[36.458vw] rounded-none"
              />
              <div className="bg-[#446184] max-[1024px]:w-[50vw] text-white h-auto p-[3vw] absolute lg:w-[29.167vw] lg:h-[36.042vw] right-0 top-[2.917vw] max-[1024px]:p-[20px] max-[1024px]:-bottom-[25px] max-[1024px]:top-[26px] max-[1024px]:right-[20px] ">
                <h3 className="text-xl lg:text-[1.25vw] lg:leading-[1.5vw] font-bold mb-3 max-[1024px]:text-[16px] max-[1024px]:leading-normal">
                  Coming Soon
                </h3>
                <p className="text-lg lg:text-[1vw] lg:leading-[1.8vw] font-normal tracking-wider leading-[35px] max-[1024px]:text-[14px] max-[1024px]:mt-0 max-[1024px]:leading-normal">
                  We're working on bringing you amazing blog content. Check back soon for inspiring stories and helpful tips!
                </p>
                <div className="flex flex-col items-end">
                  <h3 className="font-bold mt-[3.385vw] lg:text-[0.938vw] lg:leading-[1.667vw] text-right max-[1024px]:text-[10px] max-[1024px]:leading-normal max-[1024px]:mt-5 max-[1024px]:w-1/2 max-[1024px]:ml-auto">
                    BLOG
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
