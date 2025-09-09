import React from 'react';
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
import { json, Link, useLoaderData } from '@remix-run/react';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import arrowDown from '/assets/Images/arrowDown.png';

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
  console.log('blogs', blogs);
  
  const [clickedSection, setClickedSection] = React.useState(null);

  return (
    <div>
      <Header />

      <div className="mx-auto bg-[#F5F2ED] py-10 px-5 w-full h-[610px] lg:h-[950px]">
        <Heading
          text="a curated journal of modern love"
          classes={'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 mt-10'}
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-[1.354vw] lg:leading-[1.875vw] lg:w-[60%] mx-auto font-normal mt-9">
          Where registry meets style, and celebration meets intention. <br/>Explore
          stories, inspiration, and ideas for the life you're building.
        </p>

        <div className="flex flex-row justify-around items-center mt-16">
          <div className="relative cursor-pointer" onClick={() => setClickedSection(clickedSection === 'wedding' ? null : 'wedding')}>
            <img src={weddingStoryImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              WEDDING STORIES
            </p>
          </div>
          <div className="relative cursor-pointer" onClick={() => setClickedSection(clickedSection === 'ready' ? null : 'ready')}>
            <img src={readyMadeImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              READY-MADE REGISTRIES
            </p>
          </div>
          <div className="relative cursor-pointer" onClick={() => setClickedSection(clickedSection === 'planning' ? null : 'planning')}>
            <img src={planningTipsImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              REGISTRY & PLANNING TIPS
            </p>
          </div>
          <div className="relative cursor-pointer" onClick={() => setClickedSection(clickedSection === 'design' ? null : 'design')}>
            <img src={designNotesImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              DESIGN NOTES
            </p>
          </div>
          <div className="relative cursor-pointer" onClick={() => setClickedSection(clickedSection === 'taste' ? null : 'taste')}>
            <img src={tasteTravelImg} alt="" className="brightness-70" />
            <p className="text-white text-center text-2xl lg:text-[1.25vw] font-[500] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              TASTE & TRAVEL
            </p>
          </div>
        </div>
        
        {/* Arrow Down Icons */}
        <div className="flex justify-around items-center mt-4">
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'wedding' && <img src={arrowDown} alt="" className="w-6 h-6" />}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'ready' && <img src={arrowDown} alt="" className="w-6 h-6" />}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'planning' && <img src={arrowDown} alt="" className="w-6 h-6" />}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'design' && <img src={arrowDown} alt="" className="w-6 h-6" />}
          </div>
          <div className="w-[200px] flex justify-center">
            {clickedSection === 'taste' && <img src={arrowDown} alt="" className="w-6 h-6" />}
          </div>
        </div>
      </div>

      <div className="py-16 mx-auto">
        <h3 className="text-center text-[1.458vw] font-[500]">WEDDING STORIES</h3>
        <p className="text-center lg:text-[1.25vw] lg:leading-[1.875vw] text-xl lg:w-[50%] mx-auto mt-5">
          Real couples, real style. Go behind the scenes of some of our
          favourite celebrations and get <br/>inspired by how real couples infused
          style and heart into their day.
        </p>

        <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4 mt-16 px-[9.375vw]">
          {blogs.slice(0, 4).map((blog) => (
            <div key={blog.handle} className="mb-[5.156vw]">
              {blog.articles.nodes.slice(0, 1).map((article) => (
                <div key={article.id} className="w-full">
                  <img src={article.image.url} alt="" />
                  <h4 className="text-xl lg:text-[1.146vw] lg:leading-[1.458vw] font-medium mt-3">{article.title}</h4>
                  <p className="text-sm mt-2 mb-3 ivyora italic lg:text-[1.042vw] lg:leading-[1.1vw]">{article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 95)}...</p>
                  <div className='flex items-center justify-start'>
                      <Link to={`/blogs/${blog.handle}/${article.handle}`}>
                      <p className='font-bold flex items-center lg:text-[0.938vw] uppercase gap-2'>Read More<img src={readMoreIcon} alt="" /></p>
                    </Link>
            </div>
            </div>
              ))}
            </div>
          ))}
            </div>

        <div className="">
          <div className="w-full"> </div>
          <div className="w-full flex flex-col items-center">
            <p className="text-center text-[18px] font-[500] tracking-[0.8px] leading-[18px] my-[2.083vw]">
              LOADING 12 of 24
            </p>

            <WhiteThemeButton
              Text="View more"
              onClick={() => {
                // Remove this or make it static
              }} 
            />

            <button className="border-b mx-auto cursor-pointer mb-[9.167vw] uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] hover:bg-gray-100">
              Back to Top
            </button>
            </div>
        </div>
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

      <Footer />
    </div>
  );
};

export default Inspiration;
