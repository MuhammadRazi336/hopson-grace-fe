import {useCallback, useRef, useState} from 'react';
import {defer, Form, redirect, useLoaderData} from '@remix-run/react';
import {Link, useSearchParams} from '@remix-run/react';
import Faqs from '~/components/Faqs';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import {useNavigate} from 'react-router-dom';
import {Header} from '~/components/Header';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const firstName = url.searchParams.get('firstName');
  const fianceFirstName = url.searchParams.get('fianceFirstName');
  const res = await context.ClientGet(
    `users/find-couple?firstName=${firstName || ''}&fianceFirstName=${fianceFirstName || ''}`,
    context,
  );
  return defer({data: res.data || []});
}

export default function FindCoupleForm() {
  const [firstName, setFirstName] = useState('');
  const [fianceFirstName, setFianceFirstName] = useState('');
  const [validationError, setValidationError] = useState('');
  const {data} = useLoaderData();
  const [searchParams] = useSearchParams();
  
  // Check if we have search parameters (from header search)
  const hasSearchParams = searchParams.get('firstName') || searchParams.get('fianceFirstName');
  
  return (
    <div>
      <Header />
      {data && data.length > 0 ? (
        <CoupleListing data={data} />
      ) : hasSearchParams ? (

        <>
          <div
            className="flex justify-start items-center h-[80vh]"
            style={{
              backgroundImage: " url('/assets/Images/couple-banner2.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="md:ml-20 md:mr-0 ml-auto mr-auto">
              <div className="flex flex-col items-center justify-center w-full max-w-[clamp(300px,80vw,881px)] max-h-[552px] py-10 px-6 md:py-20 md:px-[6rem] lg:px-[8rem] bg-[#446184]">
                <h1 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5 text-white">
                  find a couple.
                </h1>
                <img
                  src="/assets/Images/white-bdr.png"
                  alt="couple"
                  className="max-w-[315px] mb-4"
                />
                <p className="text-center text-white uppercase md:text-xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[25px] max-w-[322px] max-[768px]:max-w-[390px] mx-auto lg:mb-8 mb-8">
                  Enter either person's <br/>first or last name
                </p>

                <form method="GET" className="w-full" onSubmit={(e) => {
                  if (!firstName.trim() && !fianceFirstName.trim()) {
                    e.preventDefault();
                    setValidationError('Please fill in at least one name field before searching.');
                    return;
                  }
                  setValidationError('');
                }}>
                  <div className="flex gap-8 mb-4">
                    <div className="w-full">
                                             <input
                         id="firstName"
                         name="firstName"
                         type="text"
                         placeholder="First Name*"
                         value={firstName}
                         className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                         
                         onChange={(e) => {
                           const value = e.target.value;
                           const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                           setFirstName(capitalized);
                           if (validationError) setValidationError('');
                         }}
                       />
                     </div>
                     <div className="w-full">
                       <input
                         id="fianceFirstName"
                         name="lastName"
                         type="text"
                         placeholder="Fiance First Name*"
                         value={fianceFirstName}
                         className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                         
                         onChange={(e) => {
                           const value = e.target.value;
                           const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                           setFianceFirstName(capitalized);
                           if (validationError) setValidationError('');
                         }}
                       />
                    </div>
                  </div>
                  {validationError && (
                    <div className="text-[#FD446F] text-center mb-4 text-sm">
                      {validationError}
                    </div>
                  )}
                  <div className="flex justify-center items-center">
                    <button
                      type="submit"
                      className="bg-white w-full max-w-[320px] py-4 mx-auto text-black px-4"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="py-24 text-center bg-[#FAF9F6] mb-16">
            {/* <h1 className="text-3xl font-semibold mb-4">No couples found</h1>
            <p className="text-gray-600 mb-8">
              No couples match your search. Try different names or browse all couples below.
            </p>
            <Link 
              to="/couple/listing" 
              className="bg-[#446184] text-white px-6 py-3 rounded hover:opacity-90"
            >
              Browse All Couples
            </Link> */}
            <h2 className='prata text-5xl font-normal'>registries</h2>
            <img src="/assets/Images/found-registries.png" alt="couple" className="max-w-[315px] mb-8 mx-auto" />
            <img src="/assets/Images/NEWLYWED-NotFound.png" alt="couple" className="max-w-[315px] mx-auto" />
            <div className="uppercase font-bold text-xl">NO REGISTRIES FOUND</div>
          </div>


          <Faqs />
          <div className="mb-16"></div>
          <section className=" my-12 lg:my-[240px]">
            <ImageAndText
              direction={'right'}
              imgBanner={teaImg}
              lineimg={lineImg3}
              title="need any advice?"
              description="Our registry experts are awaiting your call to advise on anything you need."
              buttontext={'LIVE CHAT'}
              buttontype={'Color'}
            />
          </section>
        </>
        // Show no results when searching
        
      ) : (
        <>
          <div
            className="flex justify-start items-center h-[80vh]"
            style={{
              backgroundImage: " url('/assets/Images/couple-banner2.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="md:ml-20 md:mr-0 ml-auto mr-auto">
              <div className="flex flex-col items-center justify-center w-full max-w-[clamp(300px,80vw,881px)] max-h-[552px] py-10 px-6 md:py-20 md:px-[6rem] lg:px-[8rem] bg-[#446184]">
                <h1 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5 text-white">
                  find a couple.
                </h1>
                <img
                  src="/assets/Images/white-bdr.png"
                  alt="couple"
                  className="max-w-[315px] mb-4"
                />
                <p className="text-center text-white uppercase md:text-xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[25px] max-w-[322px] max-[768px]:max-w-[390px] mx-auto lg:mb-8 mb-8">
                  Enter either person's <br/>first or last name
                </p>

                <form method="GET" className="w-full" onSubmit={(e) => {
                  if (!firstName.trim() && !fianceFirstName.trim()) {
                    e.preventDefault();
                    setValidationError('Please fill in at least one name field before searching.');
                    return;
                  }
                  setValidationError('');
                }}>
                  <div className="flex gap-8 mb-4">
                    <div className="w-full">
                                             <input
                         id="firstName"
                         name="firstName"
                         type="text"
                         placeholder="First Name*"
                         value={firstName}
                         className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                         
                         onChange={(e) => {
                           const value = e.target.value;
                           const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                           setFirstName(capitalized);
                           if (validationError) setValidationError('');
                         }}
                       />
                     </div>
                     <div className="w-full">
                       <input
                         id="fianceFirstName"
                         name="lastName"
                         type="text"
                         placeholder="Fiance First Name*"
                         value={fianceFirstName}
                         className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                         
                         onChange={(e) => {
                           const value = e.target.value;
                           const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                           setFianceFirstName(capitalized);
                           if (validationError) setValidationError('');
                         }}
                       />
                    </div>
                  </div>
                  {validationError && (
                    <div className="text-[#FD446F] text-center mb-4 text-sm">
                      {validationError}
                    </div>
                  )}
                  <div className="flex justify-center items-center">
                    <button
                      type="submit"
                      className="bg-white w-full max-w-[320px] py-4 mx-auto text-black px-4"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-20"></div>
          <Faqs />
          <div className="mb-16"></div>
          <section className=" my-12 lg:my-[240px]">
            <ImageAndText
              direction={'right'}
              imgBanner={teaImg}
              lineimg={lineImg3}
              title="need any advice?"
              description="Our registry experts are awaiting your call to advise on anything you need."
              buttontext={'LIVE CHAT'}
              buttontype={'Color'}
            />
          </section>
        </>
      )}

      {/* {data ? 'ok' : 'not ok'} */}
    </div>
  );
}

function CoupleListing({data}) {
  const [firstName, setFirstName] = useState('');
  const [fianceFirstName, setFianceFirstName] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

const resultsRef = useRef(null);


  const handleSearch = (e) => {
    e.preventDefault();
    if (!firstName.trim() && !fianceFirstName.trim()) {
      setValidationError('Please fill in at least one name field before searching.');
      return;
    }
    setValidationError('');
    navigate(`/couple/listing?firstName=${firstName}&fianceFirstName=${fianceFirstName}#results`);
  };
  return (
    <div className="">
      <>
        <div
          className="flex justify-start items-center h-[80vh]"
          style={{
            backgroundImage: " url('/assets/Images/couple-banner2.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="md:ml-20 md:mr-0 ml-auto mr-auto">
            <div className="flex flex-col items-center justify-center w-[800px] max-w-[clamp(300px,82vw,900px)] max-h-[552px] py-10 px-6 md:py-20 md:px-[6rem] lg:px-[5rem] bg-[#446184]">
              <h1 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5 text-white">
                find a couple
              </h1>
              <img
                src="/assets/Images/white-bdr.png"
                alt="couple"
                className="md:max-w-[315px] max-w-[200px] mb-4"
              />
              <p className="text-center text-white uppercase md:text-xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[25px] max-w-[322px] max-[768px]:max-w-[390px] mx-auto lg:mb-8 mb-8">
                enter either person's <br/>first or last name
              </p>

              <form method="GET" className="w-full" onSubmit={handleSearch}>
                <div className="flex gap-8 mb-4">
                  <div className="w-full">
                                         <input
                       id="firstName"
                       name="firstName"
                       type="text"
                       placeholder="First Name*"
                       value={firstName}
                       className="w-full border outline-none bg-white border-[#B9B4AE] font-semibold rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-5"
                       onChange={(e) => {
                         const value = e.target.value;
                         const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                         setFirstName(capitalized);
                         if (validationError) setValidationError('');
                       }}
                     />
                   </div>
                   <div className="w-full">
                     <input
                       id="fianceFirstName"
                       name="fianceFirstName"
                       type="text"
                       placeholder="Fiance First Name*"
                       value={fianceFirstName}
                       className="w-full border outline-none bg-white border-[#B9B4AE] font-semibold rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-5"
                       onChange={(e) => {
                         const value = e.target.value;
                         const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                         setFianceFirstName(capitalized);
                         if (validationError) setValidationError('');
                       }}
                     />
                  </div>
                </div>
                {validationError && (
                  <div className="text-[#FD446F] text-center mb-4 text-sm">
                    {validationError}
                  </div>
                )}
                <div className="flex justify-center items-center">
                  <button
                    type="submit"
                    className="bg-white w-full max-w-[320px] py-4 mx-auto text-black px-4"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <h2 id='results' ref={resultsRef} className="mt-0 pt-24 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5 scroll-mt-[60px]">
          {/* we found {data.filter(couple => couple.registry).length}  */}
          registries
        </h2>

        <img
          src="/assets/Images/found-registries.png"
          alt="couple"
          className="max-w-[315px] mb-8 mx-auto"
        />

        <div className="">
          {console.log(data)}
          {data
            .filter(couple => couple.registry) // Only show couples with registries
            .map((couple) => (
            <div key={couple.id} className="flex justify-center items-center flex-col gap-y-4 pb-4">
              {couple.event && couple.event.image && couple.event.image.fileUrl ? (
                <>
                <img src={couple.event.image.fileUrl} alt="Couple" className="w-32 h-32 mx-auto mt-12 rounded-full object-cover" />
                </>
              ) : (
                <img src="/assets/Images/couple-logo.png" alt="Couple" className="w-32 h-32 mx-auto mt-12 rounded-full object-cover" />
              )}
              {/* <img
                src={couple.event.image.fileUrl !== null ? couple.event.image.fileUrl : `/assets/Images/couple-logo.png`}
                alt="Couple"
                className="w-32 h-32 mx-auto mt-12 rounded-full object-cover"
              /> */}

              <h3 className="text-center prata md:text-3xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[35px] max-w-[700px] leading-[44px] lowercase">
                {(couple.firstName || '') + ' ' + (couple.lastName || '') + ' & ' + (couple.fianceFirstName || '') + ' ' + (couple.fianceLastName || '')}
              </h3>

              <p className="text-center text-lg text-[#1F1D1B] uppercase">
                {couple.createdAt ? new Date(couple.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) : 'Date not available'}
              </p>
              {couple.registry && couple.registry.status === "published" ? 
              <Link to={`/couple/single/${couple.id}`}>
                <button className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center">
                  View Registry
                </button>
              </Link>
              :
              <p className="text-center text-lg font-semibold  underline">
                NOTIFY ME WHEN REGISTRY IS LIVE
              </p>
              }
            </div>
          ))}
        </div>

        <div className="mt-20"></div>
        <Faqs />
        <div className="mb-16"></div>
        <section className=" my-12 lg:my-[240px]">
          <ImageAndText
            direction={'right'}
            imgBanner={teaImg}
            lineimg={lineImg3}
            title="need any advice?"
            description="Our registry experts are awaiting your call to advise on anything you need."
            buttontext={'LIVE CHAT'}
            buttontype={'Color'}
          />
        </section>
      </>
    </div>
  );
}
