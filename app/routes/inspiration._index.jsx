import React, {useState, useEffect, useRef} from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/inspirationLine.png';
import Heading from '~/components/Heading';
import weddingStoryImg from '/assets/Images/weddingStory.png';
import readyMadeImg from '/assets/Images/readyMade.png';
import planningTipsImg from '/assets/Images/planningTips.png';
import designNotesImg from '/assets/Images/designNotes.png';
import tasteTravelImg from '/assets/Images/tasteTravel.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import ImageAndText from '~/components/ImageAndText';
import lineImg3 from '/assets/Images/line.png';
import teaImg from '/assets/Images/tea.png';
import {json, Link, useLoaderData} from '@remix-run/react';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import arrowDown from '/assets/Images/arrowDown.png';

const BLOGS_QUERY = `#graphql
query GetAllBlogsAndArticlesForInspiration {
  blogs(first: 1, reverse: true) {
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
    return json({
      blogs: blogs?.nodes || [],
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
  console.log('blogsww', blogs);
  
  const [clickedSection, setClickedSection] = React.useState(null);
  const [articlesToShow, setArticlesToShow] = React.useState(12);
  const articlesGridRef = React.useRef(null);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
  const [activeStickyCategory, setActiveStickyCategory] = useState(null);
  const heroSectionRef = useRef(null);

  // Show sticky bar when scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const appClip = document.getElementById('app-clip');
      if (!appClip) return;

      const scrollTop = appClip.scrollTop;
      const heroHeight = heroSectionRef.current?.offsetHeight || 0;
      
      setIsStickyBarVisible(scrollTop > heroHeight - 100);
    };

    const appClip = document.getElementById('app-clip');
    if (appClip) {
      appClip.addEventListener('scroll', handleScroll);
      return () => appClip.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Update sticky bar active category based on clicked section
  useEffect(() => {
    setActiveStickyCategory(clickedSection);
  }, [clickedSection]);

  // Flatten all articles from all blogs
  const allArticles = blogs.flatMap(blog => 
    blog.articles.nodes.map(article => ({
      ...article,
      blogHandle: blog.handle,
      category: (article?.categoryMetafield?.value || '').toLowerCase().trim(),
    }))
  );

  // Map clicked section keys to category values in metafield
  const sectionToCategory = {
    wedding: 'wedding',
    ready: 'ready',
    planning: 'planning',
    design: 'design',
    taste: 'taste',
  };

  const activeCategory = clickedSection ? sectionToCategory[clickedSection] : null;

  // Filter articles by selected category, or show all if no category selected
  const filteredArticles = activeCategory 
    ? allArticles.filter((a) => a.category === activeCategory)
    : allArticles;

  return (
    <div>
      <Header />

      {/* Sticky Category Bar */}
      {isStickyBarVisible && (
        <div className="sticky top-0 z-50 bg-[#1F1D1B] w-full py-4 lg:py-6 shadow-lg">
          <div className="flex justify-center items-center gap-8 lg:gap-16 px-4">
            {/* Real Weddings */}
            <button
              onClick={() => { setClickedSection('wedding'); setArticlesToShow(12); }}
              className={`relative flex flex-col items-center gap-2 pb-1 transition-opacity ${activeStickyCategory === 'wedding' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 lg:w-8 lg:h-8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  <circle cx="8" cy="9" r="1.5"/>
                  <circle cx="16" cy="9" r="1.5"/>
                </svg>
              </div>
              <span className="text-white text-xs lg:text-sm font-medium uppercase tracking-wide">
                REAL WEDDINGS
              </span>
              {activeStickyCategory === 'wedding' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>

            {/* The Planning Edit */}
            <button
              onClick={() => { setClickedSection('planning'); setArticlesToShow(12); }}
              className={`relative flex flex-col items-center gap-2 pb-1 transition-opacity ${activeStickyCategory === 'planning' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 lg:w-8 lg:h-8">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  <path d="M9 11l3-3 3 3 2-2-5-5-5 5z"/>
                </svg>
              </div>
              <span className="text-white text-xs lg:text-sm font-medium uppercase tracking-wide">
                THE PLANNING EDIT
              </span>
              {activeStickyCategory === 'planning' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>

            {/* At Home */}
            <button
              onClick={() => { setClickedSection('design'); setArticlesToShow(12); }}
              className={`relative flex flex-col items-center gap-2 pb-1 transition-opacity ${activeStickyCategory === 'design' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 lg:w-8 lg:h-8">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-white text-xs lg:text-sm font-medium uppercase tracking-wide">
                AT HOME
              </span>
              {activeStickyCategory === 'design' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>

            {/* Travel & Culture */}
            <button
              onClick={() => { setClickedSection('taste'); setArticlesToShow(12); }}
              className={`relative flex flex-col items-center gap-2 pb-1 transition-opacity ${activeStickyCategory === 'taste' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 lg:w-8 lg:h-8">
                  <path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.45 0-2.99.22-4.28.79C1.49 5.62 1 6.33 1 7.14v11.28c0 1.3 1.22 2.26 2.48 1.94.88-.23 1.9-.35 2.96-.35 1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.7 0 3.55.38 5.5 1.5 1.05-.7 2.2-1.1 3.52-1.1.96 0 1.98.12 2.86.35 1.26.32 2.48-.64 2.48-1.94V7.14c0-.81-.49-1.52-1.22-1.85-1.29-.57-2.83-.79-4.28-.79zM21 17.23c0 .63-.58 1.09-1.2.98l-2.24-.3c-1.1-.15-2.25.05-3.18.65-1.35.85-3.8 1.5-5.5 1.5-1.7 0-3.55-.38-5.5-1.5-.93-.6-2.08-.8-3.18-.65l-2.24.3C.58 18.32 0 17.86 0 17.23V7.14c0-.52.31-.97.77-1.17.39-.18.82-.27 1.23-.27 2.22 0 4.63.61 6.5 1.5 1.85.89 4.15 1.5 6.5 1.5 2.35 0 4.65-.61 6.5-1.5 1.87-.89 4.28-1.5 6.5-1.5.41 0 .84.09 1.23.27.46.2.77.65.77 1.17v10.09z"/>
                </svg>
              </div>
              <span className="text-white text-xs lg:text-sm font-medium uppercase tracking-wide">
                TRAVEL & CULTURE
              </span>
              {activeStickyCategory === 'taste' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
          </div>
        </div>
      )}

      <div ref={heroSectionRef} className="mx-auto bg-[#F5F2ED] py-10 px-5 w-full h-[610px] lg:h-[950px]">
        <Heading
          text="a curated journal of modern love"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 mt-10'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-[1.354vw] lg:leading-[1.875vw] lg:w-[60%] mx-auto font-normal mt-9">
          Where registry meets style, and celebration meets intention. <br />
          Explore stories, inspiration, and ideas for the life you're building.
        </p>

        <div className="flex flex-row justify-around items-center mt-16">
          <div
            className="relative cursor-pointer"
            onClick={() => { setClickedSection('wedding'); setArticlesToShow(12); }}
          >
            <img src={weddingStoryImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              WEDDING STORIES
            </p>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { setClickedSection('ready'); setArticlesToShow(12); }}
          >
            <img src={readyMadeImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              READY-MADE REGISTRIES
            </p>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { setClickedSection('planning'); setArticlesToShow(12); }}
          >
            <img src={planningTipsImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              REGISTRY & PLANNING TIPS
            </p>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { setClickedSection('design'); setArticlesToShow(12); }}
          >
            <img src={designNotesImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              DESIGN NOTES
            </p>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => { setClickedSection('taste'); setArticlesToShow(12); }}
          >
            <img src={tasteTravelImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              TASTE & TRAVEL
            </p>
          </div>
        </div>
        
        {/* Arrow Down Icons */}
        <div className="flex justify-around items-center mt-4">
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'wedding' && (
              <img src={arrowDown} alt="" className="w-6 h-6" />
            )}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'ready' && (
              <img src={arrowDown} alt="" className="w-6 h-6" />
            )}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'planning' && (
              <img src={arrowDown} alt="" className="w-6 h-6" />
            )}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'design' && (
              <img src={arrowDown} alt="" className="w-6 h-6" />
            )}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'taste' && (
              <img src={arrowDown} alt="" className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      <div className="py-16 mx-auto">
        <h3 className="text-center text-[1.458vw] font-[500]">
          {clickedSection === 'wedding' ? 'WEDDING STORIES' : 
           clickedSection === 'ready' ? 'READY-MADE REGISTRIES' :
           clickedSection === 'planning' ? 'REGISTRY & PLANNING TIPS' :
           clickedSection === 'design' ? 'DESIGN NOTES' :
           clickedSection === 'taste' ? 'TASTE & TRAVEL' :
           ''}
        </h3>
        <p className="text-center lg:text-[1.25vw] lg:leading-[1.875vw] text-xl lg:w-[50%] mx-auto mt-5">
          {clickedSection === 'wedding' ? 
            "Real couples, real style. Go behind the scenes of some of our favourite celebrations and get inspired by how real couples infused style and heart into their day." :
            clickedSection === 'ready' ?
            "Discover our curated collection of ready-made registries designed to make your wedding planning effortless and stylish." :
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
            <div ref={articlesGridRef} className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4 mt-16 px-[9.375vw]">
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
                        <img src={article.image.url} alt="" className='w-full h-[390px] lg:h-[20.313vw] xl:h-[20.313vw] 2xl:h-[20.313vw] object-cover'/>
                      ) : (
                        <img src="/assets/Images/couple-logo.png" alt="" className='w-[370px] h-[390px]'/>
                      )}
                      <h4 className="text-xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] font-semibold mt-[1.667vw] mb-[14px] lg:mb-[0.729vw] xl:mb-[0.729vw] 2xl:mb-[0.729vw]">
                        {displayedTitle}
                      </h4>
                      <p className="text-sm mt-0 mb-[1.042vw] ivyora italic lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.4vw] xl:leading-[1.4vw] 2xl:leading-[1.4vw] lg:tracking-[0.052vw] xl:tracking-[0.052vw] 2xl:tracking-[0.052vw] tracking-[1px] font-normal">
                        {article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 80)}
                        ...
                      </p>
                      <div className="flex items-center justify-start">
                        <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                          <p className="font-bold flex items-center lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.458vw] xl:leading-[1.458vw] 2xl:leading-[1.458vw] uppercase gap-2">
                            Read More
                            <img src={readMoreIcon} alt="" className='w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw] xl:w-[0.833vw] xl:h-[0.833vw] 2xl:w-[0.833vw] 2xl:h-[0.833vw]' />
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
              {clickedSection === 'ready' ? 'Ready-made registries coming soon...' :
               clickedSection === 'planning' ? 'Planning tips coming soon...' :
               clickedSection === 'design' ? 'Design notes coming soon...' :
               clickedSection === 'taste' ? 'Taste & travel content coming soon...' :
               'Content coming soon...'}
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
