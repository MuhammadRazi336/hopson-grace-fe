import Accordiance from '~/components/Accordiance.jsx';
import ProductCard from '~/components/Product.jsx';
import FundCard from '~/components/FundCard.jsx';
import {defer} from '@remix-run/server-runtime';
import {Link, useLoaderData} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import EditImagePopup from '~/components/EditImagePopup';
import {CoupleFooter} from '~/components/CoupleFooter';
import {useState} from 'react';
import NotificationCard from '~/components/NotificationCard';
import RegistryStatusCard from '~/components/RegistryStatusCard';

export async function loader({request, context}) {
  const registry = context?.session?.get('@Registry');
  const user = context?.session?.get('@User');

  if (!registry || !registry.events || registry.events.length === 0) {
    throw new Response('Registry or Events not found', {status: 404});
  }

  const eventId = registry.events.id;
  if (!eventId) {
    throw new Response('Event ID not found', {status: 404});
  }

  const eventGet = await context.ClientGet(`events/${eventId}`, context);

  const userGet = await context.ClientGet(`users/${user.user.id}`, context);

  // Defensive: parse image if it's a string
  if (eventGet?.data?.image && typeof eventGet.data.image === 'string') {
    try {
      eventGet.data.image = JSON.parse(eventGet.data.image);
    } catch {
      eventGet.data.image = null;
    }
  }

  let res, cashRes;
  try {
    res = await context.ClientGet(
      `registryProducts/${registry.id}?type=gift`,
      context,
    );
  } catch (e) {
    res = {data: []};
  }
  try {
    cashRes = await context.ClientGet(
      `registryProducts/${registry.id}?type=cash`,
      context,
    );
  } catch (e) {
    cashRes = {data: []};
  }

  let mergedArray = [];
  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  );
  const productsResult = await fetchProducts(context.storefront, ids);
  const products = productsResult || {nodes: []};
  const productNodes = Array.isArray(products.nodes) ? products.nodes : [];

  if (res?.data?.length && productNodes.length > 0) {
    mergedArray = res.data.map((item1) => {
      const product = productNodes.find(
        (item2) =>
          item2 && item2.id === `gid://shopify/Product/${item1.productId}`,
      );
      // Ensure numeric fields are numbers
      const amount =
        item1.amount !== undefined ? Number(item1.amount) : undefined;
      const collectedAmount =
        item1.collectedAmount !== undefined
          ? Number(item1.collectedAmount)
          : undefined;
      if (product) {
        return {
          ...item1,
          ...product,
          amount,
          collectedAmount,
        };
      }
      return {
        ...item1,
        amount,
        collectedAmount,
      };
    });
  }

  return defer({
    data: mergedArray,
    cashfundData: cashRes?.data || [],
    eventGet,
    userGet,
    registry,
    user,
  });
}

export async function action({request, context}) {
  const contentType = request.headers.get('content-type') || '';
  let body, file;

  const {payload} = await request.json();

  const response = await context.ClientPut(
    payload,
    `events/${payload.id}`,
    context,
  );

  return json(response);
}

const index = () => {
  const {data, cashfundData, eventGet, registry, userGet, user} =
    useLoaderData();

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Add state for the note textarea
  const [note, setNote] = useState(eventGet?.data?.welcomeMessage || '');
  const maxLength = 500;
  const handleSavePreview = async () => {
    try {
      const payload = {
        id: registry.events.id,
        welcomeMessage: note,
      };
      const response = await fetch(
        `https://dev-hopsongrace.codup.io/api/events/${payload.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        alert('Message updated!');
      } else {
        alert('Failed to update message');
      }
    } catch (err) {
      alert('Error updating message');
    }
  };

  // Handle cropped image save from popup
  const handleCroppedImageSave = async (croppedBlob) => {
    if (!croppedBlob) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile.jpg');
      formData.append('id', registry.events.id);
      // Add any other required fields for your backend
      const response = await fetch(`http://localhost:3040/api/events/${registry.events.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        // Get the new image URL from the response if available
        const data = await response.json();
        let newImageUrl = data?.data?.image?.fileUrl || URL.createObjectURL(croppedBlob);
        setEventImage(newImageUrl);
        alert('Profile image updated!');
      } else {
        alert('Failed to update image');
      }
    } catch (err) {
      alert('Error updating image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between mt-6">
        <div className="flex-1 ml-[300px]">
          <div className="text-center">
            <h2 className="mt-16 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata lg:leading-[60px] font-normal mb-4">
              <span className="prata uppercase">My registry</span> homepage
            </h2>

            <img
              src="/assets/Images/profile-view-page-bdr.png"
              alt="Couple"
              className="max-w-[630px] h-auto mx-auto"
            />
            <p className="text-gray-600 max-w-[630px] mx-auto mt-10 text-2xl">
              Your guests will land here—so have fun with it! Leave them a
              message and upload your photos or video, or pick from our
              illustrations to create something uniquely you.
            </p>
          </div>
        </div>

        <div className="w-[300px] flex flex-col gap-y-4">
          <div>
            <NotificationCard />
          </div>
          <div>
            <RegistryStatusCard
              status={registry?.status}
              registryId={registry?.id}
              token={user?.accessToken}
            />
          </div>
        </div>
      </div>

      <EditImagePopup
        isOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
      />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src="/assets/Images/couple-profile-bg.png"
          alt="Couple"
          className="w-full h-auto"
        />
        {/* <div
          className="absolute top-[87%] -translate-x-[-73%] w-full h-full "
          onClick={() => setIsEditPopupOpen(true)}
        >
          <img
            src="/assets/Images/edit-icon.png"
            alt="Edit"
            className="w-auto h-auto rounded-full cursor-pointer"
          />
        </div> */}

        <div className="flex flex-wrap xl:flex-nowrap justify-center xl:items-end items-center -mb-10 xl:-translate-y-[200px] ">
          <div className="xl:w-4/12 w-full">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto">
              {userGet?.data?.user?.firstName} &{' '}
              {userGet?.data?.user?.fianceFirstName}
            </h1>
          </div>
          <div className="xl:w-4/12 w-full">
            <div className="relative">
              <img
                src="/assets/Images/couple-placeholder.png"
                alt="Couple"
                className="rounded-full xl:w-full xl:h-full h-[300px] w-[300px] mx-auto"
              />
              <div
                className="absolute top-[85%] -translate-x-[-55%] w-[70%]"
                onClick={() => setIsEditPopupOpen(true)}
              >
                <img
                  src="/assets/Images/edit-icon.png"
                  alt="Edit"
                  className="w-auto h-auto rounded-full cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="xl:w-4/12 w-full">
            <div className="mr-16">
              <p className="md:text-[42px] text-right my-2 leading-[1.25] prata ml-auto">
                {eventGet?.data?.eventDate}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[370px] h-auto ml-auto"
              />
              <div className="uppercase text-right ">
                <p className="text-lg my-1">{eventGet?.data?.location}</p>
                <p className="text-lg my-1">
                  {eventGet?.data?.province}, {eventGet?.data?.city}
                </p>
                <p className="text-lg my-1">{eventGet?.data?.weddingTime}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mb-14">
          <div className="border-3 border-gray-300 rounded p-4">
            <textarea
              className="w-full h-32 resize-none outline-none border-none text-gray-700 text-base placeholder-gray-500"
              maxLength={maxLength}
              placeholder="Write a short note to friends and family — a warm welcome, a thank you, or why you chose these gifts. (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm italic text-gray-400">
              {maxLength - note.length}/{maxLength} characters remaining
            </span>
            <button
              className="uppercase font-bold text-gray-500 border-b-2 border-gray-400 tracking-wider text-sm px-2 py-1"
              onClick={handleSavePreview}
              type="button"
            >
              Save & Preview
            </button>
            <Link to={`/dashboard/registry/${registry.events.id}`}>
              <button
                className="uppercase font-bold text-gray-500 border-b-2 border-gray-400 tracking-wider text-sm px-2 py-1"
                type="button"
              >
                Edit Registry Details
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto bg-[#FAF9F6] py-10 px-6">
        <h2 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5">
          our registry selections
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] h-auto mx-auto"
        />

        <div className="filters">
          <div className="filter-item flex gap-x-12 mt-12 justify-center">
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>Categories</strong> All{' '}
            </h3>
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>price</strong> low to high{' '}
            </h3>
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>status</strong> All{' '}
            </h3>
          </div>
        </div>
        <div className="gap-6 p-6 mt-12">
          <h2 className="text-2xl font-bold text-center">GIFTS</h2>
          <ProductPage data={data} />
        </div>

        <div className="gap-6 p-6 mt-12">
          <h2 className="text-2xl font-bold text-center">CASH FUNDS</h2>
          <FundPage data={cashfundData} />
        </div>
      </div>
      <div className="container pt-12 md:flex-nowrap flex-wrap mx-auto flex lg:gap-8 gap-2 items-stretch flex-row-reverse">
        <div className="py-10 px-6 md:py-12 md:px-[6rem] lg:px-[8rem] bg-[#446184] relative flex items-center justify-center flex-col  lg:w-[65%] w-full max-[768px]:p-10 lg:mt-20 mt-6">
          <h3 className="text-2xl text-white lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center">
            gift any amount
          </h3>
          <img
            src="/assets/Images/white-bdr.png"
            alt="couple"
            className="max-w-[315px] mb-4 mt-4"
          />
          <h5 className="text-white text-xl font-normal">
            CONTRIBUTE TO OUR JOURNEY!
          </h5>
          <p className="text-sm lg:text-xl text-white max-w-[488px] mt-4 mb-4 font-normal text-center">
            Help us create our dream wedding, honeymoon or life experience.
            We're so grateful.
          </p>
          <div>
            <div className="flex justify-center items-center gap-x-6">
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $100
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $500
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                None
              </button>
            </div>
          </div>
        </div>
        <div className="lg:w-[35%] w-full  ">
          {' '}
          <img
            src="/assets/Images/gift.png"
            alt="Image Banner"
            className="max-[1024px]:h-full object-cover object-[80%]"
          />
        </div>
      </div>

      <CoupleFooter />
    </>
  );
};

export default index;
const ProductPage = ({data}) => {
  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
        {data.length > 0 ? (
          data.map((product) => {
            // Use priceV2 from Shopify, fallback to backend amount
            const priceObj = product.variants?.edges?.[0]?.node?.priceV2;
            const price =
              priceObj && priceObj.amount && priceObj.currencyCode
                ? {amount: priceObj.amount, currencyCode: priceObj.currencyCode}
                : product.amount
                ? {amount: product.amount, currencyCode: 'USD'}
                : null;

            return (
              <ProductCard
                key={product.id || product.productId || Math.random()}
                productName={product.title || 'No Name'}
                productImage={
                  product.images?.edges?.[0]?.node?.url ||
                  'https://www.dummyimage.co.uk'
                }
                price={
                  price && price.amount && price.currencyCode
                    ? price
                    : {amount: 0, currencyCode: 'USD'}
                }
                collected={
                  typeof product.collectedAmount === 'number'
                    ? product.collectedAmount
                    : 0
                }
                isGroupGift={!!product.isGroupGift}
                onContributorsClick={() =>
                  console.log(`Contributors for ${product.title || 'Unknown'}`)
                }
              />
            );
          })
        ) : (
          <>
            <div className="flex justify-center items-center h-full">
              <Link to="dashboard/addgifts">
                <img
                  src="/assets/Images/add-gift-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="dashboard/addgifts">
                <img
                  src="/assets/Images/add-gift-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="dashboard/addgifts">
                <img
                  src="/assets/Images/add-gift-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="dashboard/addgifts">
                <img
                  src="/assets/Images/add-gift-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
const FundPage = ({data}) => {
  data.length === 0;
  console.log(data.length);

  // Defensive: handle missing or malformed data
  if (!Array.isArray(data)) return <div>No funds available.</div>;

  const handleViewContributors = (fundName) => {
    // ...
  };

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
        {data.length > 0 ? (
          data.map((fund) => (
            <FundCard
              key={fund.productId || Math.random()}
              image={fund.cashFund.image?.fileUrl}
              title={fund.cashFund?.name || 'No Fund Name'}
              totalAmount={Number(fund.amount) ? fund.amount : 0}
              collectedAmount={
                Number(fund.collectedAmount) ? fund.collectedAmount : 0
              }
              onViewContributors={() =>
                handleViewContributors(fund.cashFund?.name || 'Unknown')
              }
            />
          ))
        ) : (
          <>
            <div className="flex justify-center items-center h-full">
              <Link to="/dashboard/cashfunds">
                <img
                  src="/assets/Images/add-cash-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="/dashboard/cashfunds">
                <img
                  src="/assets/Images/add-cash-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="/dashboard/cashfunds">
                <img
                  src="/assets/Images/add-cash-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
            <div className="flex justify-center items-center h-full">
              <Link to="/dashboard/cashfunds">
                <img
                  src="/assets/Images/add-cash-placeholder.png"
                  alt="No funds"
                  className="w-[80%] h-auto"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
