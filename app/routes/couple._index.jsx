import {useCallback, useState} from 'react';
import {defer, Form, redirect, useLoaderData} from '@remix-run/react';
import {Link} from '@remix-run/react';
import Faqs from '~/components/Faqs';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import {useNavigate} from 'react-router-dom';
import {Header} from '~/components/Header';
import { Footer } from '~/components/Footer';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const firstName = url.searchParams.get('firstName');
  const fianceFirstName = url.searchParams.get('fianceFirstName');
  const res = await context.ClientGet(
    `users/find-couple?firstName=${firstName}&fianceFirstName=${fianceFirstName}`,
    context,
  );
  if (!res.data) {
    throw new Response('Not Found', {status: 404});
  }
  return defer({data: res.data, name: {firstName, fianceFirstName}});
}

export default function FindCoupleForm() {
  const [firstName, setFirstName] = useState('');
  const [fianceFirstName, setFianceFirstName] = useState('');
  const [validationError, setValidationError] = useState('');
  const {data, name} = useLoaderData();
  const navigate = useNavigate();

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
    <div>
      <Header />
      {name?.firstName ? (
        <CoupleListing data={data} />
      ) : (
        <>
          <div
            className="flex justify-start items-center lg:h-[51.771vw] xl:h-[51.771vw] 2xl:h-[51.771vw] mb-16 max-[1024px]:py-20"
            style={{
              backgroundImage: " url('/assets/Images/couple-banner2.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="md:ml-20 md:mr-0 ml-auto mr-auto">
              <div className="flex flex-col items-center justify-center w-[800px] max-w-[clamp(300px,82vw,900px)] max-h-[552px] py-10 px-6 md:py-20 md:px-[6rem] lg:px-[5rem] bg-[#446184] relative max-[1024px]:top-[300px]">
                <h1 className="mt-0 lg:text-[2.5vw] text-[24px] prata text-center lg:leading-[2.917vw] font-normal mb-5 text-white">
                find a couple.
                </h1>
                <img
                  src="/assets/Images/white-bdr.png"
                  alt="couple"
                  className="w-[315px] lg:w-[16.406vw] max-w-full mb-4"
                />
                <p className="text-center tracking-[0.8px] lg:text-[22px] lg:leading-[1.354vw] text-white uppercase max-w-[322px] max-[768px]:max-w-[390px] mx-auto lg:mb-8 mb-8">
                Enter either person's <br/>first or last name
                </p>

                <form method="GET" className="w-full" onSubmit={handleSearch}>
                  <div className="flex gap-8 lg:gap-[1.458vw] mb-4 lg:mb-[2.448vw] max-[1024px]:flex-col max-[1024px]:gap-0 max-[1024px]:mb-[5px] ">
                    <div className="w-full">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name*"
                        value={firstName}
                        className="w-full border lg:text-[1.042vw] lg:h-[4.271vw] h-[50px] text-[16px] outline-none bg-white border-[#B9B4AE] rounded-none px-3"
                        
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length > 0) {
                            setFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                          } else {
                            setFirstName(value);
                          }
                          if (validationError) setValidationError('');
                        }}
                      />
                    </div>
                    <div className="w-full">
                      <input
                        id="fianceFirstName"
                        name="fianceFirstName"
                        type="text"
                        placeholder="Fiance's First Name*"
                        value={fianceFirstName}
                        className="w-full border outline-none lg:text-[1.042vw] lg:h-[4.271vw] h-[50px] text-[16px] bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-5"
                        
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length > 0) {
                            setFianceFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                          } else {
                            setFianceFirstName(value);
                          }
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
                      className="bg-white tracking-[0.8px] w-full max-w-[320px] h-[50px] lg:h-[4.063vw] lg:max-w-[16.667vw] uppercase text-[18px] leading-[18px] py-0 mx-auto font-[500] text-black px-4 max-[1024px]:w-full max-[1024px]:max-w-full max-[768px]:max-w-none max-[768px]:px-0"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-20 lg:mt-[9.01vw]"></div>
          <Faqs content="guest"/>
          <div className="mb-16"></div>
          <section className=" my-12 lg:my-[240px]">
            <ImageAndText
              direction={'right'}
              imgBanner={teaImg}
              lineimg={lineImg3}
              title="questions?"
              description="We’ve got answers."
              buttontext={'CONTACT US'}
              buttontype={'Color'}
              buttonLink={'/contact-us'}
            />
          </section>
          <Footer />
        </>
      )}

      <Footer />
    </div>
  );
}

export function FindCoupleFormBanner() {
  const [firstName, setFirstName] = useState('');
  const [fianceFirstName, setFianceFirstName] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

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
    <div
      className="flex justify-start items-center h-[80vh] mb-16"
      style={{
        backgroundImage: " url('/assets/Images/couple-banner2.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="md:ml-20 md:mr-0 ml-auto mr-auto lg:w-[45.885vw]">
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

          <form method="GET" className="w-full" onSubmit={handleSearch}>
            <div className="flex gap-8 mb-4">
              <div className="w-full">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name*"
                  value={firstName}
                  className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 lg:px-[1.042vw] py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                    } else {
                      setFirstName(value);
                    }
                    if (validationError) setValidationError('');
                  }}
                />
              </div>
              <div className="w-full">
                <input
                  id="fianceFirstName"
                  name="lastName"
                  type="text"
                  placeholder="Fiance's First Name*"
                  value={fianceFirstName}
                  className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 lg:px-[1.042vw] py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setFianceFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                    } else {
                      setFianceFirstName(value);
                    }
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
  );
}

function FindCoupleBanner({firstName, setFirstName, fianceFirstName, setFianceFirstName}) {
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

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
    <div
      className="flex justify-start items-center h-[80vh] mb-16"
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
          <form method="GET" className="w-full" onSubmit={handleSearch}>
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
                    if (value.length > 0) {
                      setFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                    } else {
                      setFirstName(value);
                    }
                    if (validationError) setValidationError('');
                  }}
                />
              </div>
              <div className="w-full">
                <input
                  id="fianceFirstName"
                  name="fianceFirstName"
                  type="text"
                  placeholder="Fiance's First Name*"
                  value={fianceFirstName}
                  className="w-full border outline-none bg-white border-[#B9B4AE] rounded-none px-3 py-4 sm:py-5 lg:py-6 xl:py-5 2xl:py-6"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setFianceFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                    } else {
                      setFianceFirstName(value);
                    }
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
  );
}

function CoupleListing({data}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Couples Listing</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-center">Couple Name</th>
            <th className="py-2 px-4 border-b text-center">Image</th>
            <th className="py-2 px-4 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((couple) => (
            <tr key={couple.id}>
              <td className="py-2 px-4 border-b text-center">
                {couple.firstName + couple.lastName}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <img
                  src={`path/to/coupleImage.png`}
                  alt="Couple"
                  className="w-16 h-16 mx-auto"
                />
              </td>
              <td className="py-2 px-4 border-b text-center">
                <Link to={`/couple/single/${couple.id}`}>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    View Profile
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
