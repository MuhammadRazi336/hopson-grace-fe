import Accordiance from '~/components/Accordiance.jsx';
import {defer} from '@remix-run/server-runtime';
import {Link, useLoaderData, json} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import EditImagePopup from '~/components/EditImagePopup';
import EditBackgroundImagePopup from '~/components/EditBackgroundImagePopup';
import {CoupleFooter} from '~/components/CoupleFooter';
import {useState} from 'react';
import RegistryStatusCard from '~/components/RegistryStatusCard';
import PreviewRegistry from '~/components/PreviewRegistry';

export async function loader({request, context}) {
  const user = context?.session?.get('@User');
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  if (
    !registry.data ||
    !Array.isArray(registry.data) ||
    registry.data.length === 0
  ) {
    throw new Response('Registry data not found or empty', {status: 404});
  }

  const registryData = registry.data[0];

  if (
    !registryData ||
    !registryData.events ||
    !Array.isArray(registryData.events) ||
    registryData.events.length === 0
  ) {
    throw new Response('Registry or Events not found', {status: 404});
  }

  const eventId = registryData.events[0].id;
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

  // Defensive: parse backgroundImage if it's a string
  if (
    eventGet?.data?.backgroundImage &&
    typeof eventGet.data.backgroundImage === 'string'
  ) {
    try {
      eventGet.data.backgroundImage = JSON.parse(eventGet.data.backgroundImage);
    } catch {
      eventGet.data.backgroundImage = null;
    }
  }

  let res, cashRes;
  try {
    res = await context.ClientGet(
      `registryProducts/${registryData.id}?type=gift`,
      context,
    );
  } catch (e) {
    res = {data: []};
  }
  try {
    cashRes = await context.ClientGet(
      `registryProducts/${registryData.id}?type=cash`,
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

  const apiBaseUrl = context.env?.API_BASE_URL || 'http://localhost:3040';

  return defer({
    data: mergedArray,
    cashfundData: cashRes?.data || [],
    eventGet,
    userGet,
    registry,
    user,
    apiBaseUrl,
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
  const loaderData = useLoaderData();
  const {data, cashfundData, eventGet, registry, userGet, user, apiBaseUrl} =
    loaderData;

    console.log('cashfundData', cashfundData);

  // Fallback for apiBaseUrl if it's not available from loader
  const finalApiBaseUrl =
    apiBaseUrl || 'http://localhost:3040' || 'https://dev-hopsongrace.codup.io';

  // Get the actual registry data from the response
  const registryData = registry?.data?.[0];

  console.log(registryData);

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isBackgroundEditPopupOpen, setIsBackgroundEditPopupOpen] =
    useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const [eventImage, setEventImage] = useState(
    eventGet?.data?.image?.fileUrl || null,
  );
  const [backgroundImage, setBackgroundImage] = useState(
    eventGet?.data?.backgroundImage?.fileUrl ||
      (eventGet?.data?.backgroundImage &&
      typeof eventGet.data.backgroundImage === 'string'
        ? eventGet.data.backgroundImage
        : null) ||
      '/assets/Images/couple-profile-bg.png',
  );

  // Add state for the note textarea
  const [note, setNote] = useState(eventGet?.data?.welcomeMessage || '');
  const maxLength = 500;
  const handleSavePreview = async () => {
    try {
      const payload = {
        id: registryData?.events?.[0]?.id,
        welcomeMessage: note,
      };
      const response = await fetch(
        `${finalApiBaseUrl}/api/events/${payload.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`,
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
    if (!croppedBlob) {
      alert('No image to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile.jpg');
      formData.append('id', registryData?.events?.[0]?.id);

      const response = await fetch(
        `${finalApiBaseUrl}/api/events/${registryData?.events?.[0]?.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.accessToken}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response:', data);

        // Update the event image state
        if (data.data && data.data.image) {
          const newImageUrl = data.data.image.fileUrl || data.data.image;
          setEventImage(newImageUrl);
          alert('Profile image updated successfully!');
        } else {
          // Fallback to blob URL for immediate display
          const blobUrl = URL.createObjectURL(croppedBlob);
          setEventImage(blobUrl);
          alert('Profile image updated!');
        }
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert('Failed to update image. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error updating image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle background image save from popup
  const handleBackgroundImageSave = async (croppedBlob) => {
    if (!croppedBlob) {
      alert('No background image to upload');
      return;
    }

    setIsBackgroundUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'background.jpg');

      const response = await fetch(
        `${finalApiBaseUrl}/api/events/${registryData?.events?.[0]?.id}/background-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.accessToken}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Background upload response:', data);

        // Update the background image state
        if (data.data && data.data.data && data.data.data.backgroundImage) {
          const newBackgroundUrl = data.data.data.backgroundImage.fileUrl;
          setBackgroundImage(newBackgroundUrl);
          alert('Background image updated successfully!');
        } else {
          // Fallback to blob URL for immediate display
          const blobUrl = URL.createObjectURL(croppedBlob);
          setBackgroundImage(blobUrl);
          alert('Background image updated!');
        }
      } else {
        const errorData = await response.json();
        console.error('Background upload failed:', errorData);
        alert('Failed to update background image. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading background image:', err);
      alert('Error updating background image. Please try again.');
    } finally {
      setIsBackgroundUploading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between mt-6">
        <div className="flex-1 lg:ml-[15.625vw]">
          <div className="text-center">
            <h2 className="mt-16 lg:text-[48px] xl:text-4xl 2xl:text-[48px] text-[24px] ivyora lg:leading-[60px] font-normal mb-4">
              <span className="prata uppercase">My registry</span> homepage
            </h2>

            <svg className='mx-auto mt-[30px]' width="757" height="10" viewBox="0 0 757 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.83965C181.526 3.83965 361.053 3.83965 540.579 3.83965C595.616 3.83965 650.652 3.83965 705.689 3.83965C714.879 3.83965 750.471 -2.35887 755 8" stroke="#1F1D1B" stroke-width="3" stroke-linecap="round"/>
            </svg>

            <p className="max-w-[43.958vw] text-[#1F1D1B] mx-auto mt-[39px] text-2xl lg:text-[26px] lg:leading-[36px]">
              Your guests will land here—so have fun with it! Leave them a
              message and upload your photos or video, or pick from our
              illustrations to create something uniquely you.
            </p>
          </div>
        </div>

        <div className="w-[300px] flex flex-col gap-y-4">
          <div>
            <RegistryStatusCard
              status={registryData?.status}
              registryId={registryData?.id}
              token={user?.accessToken}
            />
          </div>

<Link to={`/couple/single/${registryData?.userId}`}>
          <div className="w-[260px] min-h-[100px] bg-[#F5F2ED] z-10">
            <div className="container mx-auto pt-3">
              <img
                src="/assets/Images/share-icon.png"
                alt="preview"
                className="w-10 mx-auto filter brightness-0"
              />
              <h2 className="text-black text-sm text-center font-bold mt-2">
                PREVIEW PAGE
              </h2>
            </div>
          </div>
          </Link>
        </div>
      </div>

      <EditImagePopup
        isOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
        onSave={handleCroppedImageSave}
      />
      <EditBackgroundImagePopup
        isOpen={isBackgroundEditPopupOpen}
        onClose={() => setIsBackgroundEditPopupOpen(false)}
        onSave={handleBackgroundImageSave}
      />
      <div className="text-center pt-[80px] px-[3.281vw] mx-auto font-sans">
        <div className="relative">
          <img
            src={backgroundImage}
            alt="Couple Background"
            className="w-full h-[400px] lg:h-[600px] object-cover"
          />
          <div
            className="absolute top-[2.396vw] right-[2.396vw] cursor-pointer w-[5.833vw] height[5.833vw]"
            onClick={() =>
              !isBackgroundUploading && setIsBackgroundEditPopupOpen(true)
            }
          >
            <div className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50">
              <img
                src="/assets/Images/edit-icon.png"
                alt="Edit Background"
                className={`w-auto h-auto ${
                  isBackgroundUploading ? 'opacity-50' : ''
                }`}
              />
              {isBackgroundUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
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

        <div className="flex flex-wrap xl:flex-nowrap justify-center items-start -mb-10 xl:-translate-y-[200px] ">
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px]">
            <h1 className="md:text-[4.479vw] md:leading-[4.792vw] my-2 max-w-[340px] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto">
              {userGet?.data?.user?.firstName} &{' '}
              {userGet?.data?.user?.fianceFirstName}
            </h1>
          </div>
          <div className="lg:w-[36.979vw] lg:min-w-[36.979vw] lg:min-h-[36.979vw] lg:h-[36.979vw] w-full">
            <div className="relative">
              <img
                src={eventImage || '/assets/Images/couple-placeholder.png'}
                alt="Couple"
                className="rounded-full xl:w-full xl:h-full h-[300px] w-[300px] mx-auto object-cover"
              />
              <div
                className="absolute -bottom-[2.604vw] left-[50%] translate-x-[-50%] w-[5.938vw] h-[5.938vw]"
                onClick={() => !isUploading && setIsEditPopupOpen(true)}
              >
                <img
                  src="/assets/Images/edit-icon.png"
                  alt="Edit"
                  className={`w-auto h-auto rounded-full cursor-pointer ${
                    isUploading ? 'opacity-50' : ''
                  }`}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px]">
            <div className="mr-16">
              <p className="md:text-[2.5vw] text-right my-2 md:leading-[2.917vw] prata ml-auto">
                {eventGet?.data?.eventDate}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[19.219vw] h-auto ml-auto"
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
            <Link to={`/dashboard/registry/${registryData.events[0].id}`}>
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
      <div className="mx-auto w-[calc(100%-7.812vw)] pt-[4.427vw] pb-[9vw] px-[3.906vw] bg-[#FAF9F6] ">
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
        <div className="gap-6 mt-12">
          <h2 className="text-[30px] leading-[36px] font-bold text-center">GIFTS</h2>
          <ProductPage data={data} />
        </div>

        <div className="gap-6 mt-12">
          <h2 className="text-[30px] leading-[36px] font-bold text-center">CASH FUNDS</h2>
          <FundPage data={cashfundData} />
        </div>
      </div>
      <div className="py-12 w-full flex justify-center items-center">
        <div className="py-10 md:py-12 bg-[#446184] flex items-center justify-between flex-row lg:w-[81.354vw] lg:min-h-[28.698vw] w-full max-[768px]:p-10 lg:mt-20 mt-6 gap-x-16">
          <div className='pl-[25px]'>
            <img
              src="/assets/Images/giftCard.png"
              alt="gift"
              className="w-full h-full object-cover"
            />
          </div>
          <div className='flex flex-col items-center justify-center pr-[7.656vw]'>
            <h3 className="text-2xl text-white lg:text-[44px] lg:leading-[36px] 3xl:w-full prata max-w-[410px] text-center">
              add a gift card
            </h3>
            <img
              src="/assets/Images/white-bdr.png"
              alt="couple"
              className="max-w-[325.9px] mb-[35px] mx-auto mt-[25px]"
            />
            <h5 className="text-white text-[24px] leading-[44px] text-center font-[500]">
              CONTRIBUTE TO OUR JOURNEY!
            </h5>
            <p className="text-sm lg:text-[24px] leading-[30px] text-white max-w-[30.99vw] mt-4 mb-7 font-normal text-center">
              Help us create our dream wedding, honeymoon or life experience.
              We're so grateful.
            </p>
            <Link to="/dashboard/giftcards">
              <button
                type="button"
                className="text-black font-bold py-4 px-8 bg-[#F5F2ED] w-[296px] h-[78px] text-[18px] leading-[18px] rounded-none cursor-pointer mx-auto block"
              >
                ADD GIFT CARDS
              </button>
            </Link>
          </div>
        </div>
      </div>

      <CoupleFooter />
    </>
  );
};

export default index;
const ProductPage = ({data}) => {
  // Calculate how many placeholder images to show
  const actualGiftsCount = data.length;
  const placeholderCount = Math.max(0, 4 - actualGiftsCount);

  // Create array of placeholder elements
  const placeholderElements = Array.from(
    {length: placeholderCount},
    (_, index) => (
      <div
        key={`placeholder-${index}`}
        className={`h-[380px] mb-4 flex items-center justify-center ${
          data.length > 4 ? 'snap-start min-w-[360px] max-w-[360px]' : 'w-full'
        }`}
      >
        <Link to="/dashboard/addgifts">
          <img
            src="/assets/Images/add-gift-placeholder.png"
            alt="Add gift placeholder"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    ),
  );

  return (
    <div className="container">
      <div
        className={`${
          data.length > 4
            ? 'flex gap-[3.281vw] mt-12 overflow-x-auto snap-x snap-mandatory'
            : 'grid gap-[3.281vw] mt-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-hidden'
        }`}
        style={{
          scrollSnapType: data.length > 4 ? 'x mandatory' : undefined,
        }}
      >
        {data.length > 0
          ? data.map((product) => {
              // Use priceV2 from Shopify, fallback to backend amount
              const priceObj = product.variants?.edges?.[0]?.node?.priceV2;
              const price =
                priceObj && priceObj.amount && priceObj.currencyCode
                  ? {
                      amount: priceObj.amount,
                      currencyCode: priceObj.currencyCode,
                    }
                  : product.amount
                  ? {amount: product.amount, currencyCode: 'USD'}
                  : null;

              // Calculate if product is fully gifted
              const quantity = product.quantity || 1;
              const purchasedQuantity = Number(product.purchasedQuantity) || 0;
              const stillNeeds = Math.max(0, quantity - purchasedQuantity);
              const isFullyGifted = stillNeeds === 0;

              // Determine status
              let status = 'addToCart';
              if (isFullyGifted) {
                status = 'purchased';
              } else if (product.isGroupGift) {
                status = 'groupGift';
              }

              return (
                <div
                  key={product.id || product.productId || Math.random()}
                  className={`${
                    isFullyGifted ? 'overlay-gifted' : ''
                  } p-4 flex flex-col justify-between ${
                    data.length > 4
                      ? 'snap-start min-w-[360px] max-w-[360px]'
                      : 'w-full'
                  }`}
                >
                  <div className="flex flex-col justify-between">
                    <div className="h-[380px] w-full mb-4 flex items-center justify-center relative">
                      <img
                        src={
                          product.images?.edges?.[0]?.node?.url ||
                          '/assets/Images/placeholder.png'
                        }
                        alt={product.title || 'Product'}
                        className="w-full h-full object-cover mb-4"
                      />

                      {product.isGroupGift && (
                        <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                          <h2 className="prata text-black text-sm text-center font-bold mt-1">
                            group <br /> gift
                          </h2>
                        </div>
                      )}
                    </div>

                    <h2
                      className={`text-lg font-semibold ${
                        isFullyGifted
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      {product.title || 'No Name'}
                    </h2>

                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-md">
                        ${price?.amount || product.amount || 0}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-row items-center gap-6">
                      <p className="text-sm text-gray-500 italic">
                        Requested: {quantity}
                      </p>
                      <p className="text-sm text-gray-500 italic">
                        Still Needs: {stillNeeds}
                      </p>
                    </div>

                    {product.isGroupGift && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Contributed: $
                          {Number(product.collectedAmount || 0).toFixed(2)} / $
                          {Number(product.amount || 0).toFixed(2)}
                        </p>
                        <p className="text-sm italic my-2 text-right w-full mb-2 text-gray-600">
                          Remaining: $
                          {Math.max(
                            0,
                            (product.amount || 0) -
                              (product.collectedAmount || 0),
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col justify-end">
                    {product.isGroupGift && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Group Gift</p>
                        <Link to="/dashboard/shipgifts">
                          <button className="bg-white w-full border px-4 py-4 uppercase text-sm font-semibold hover:bg-black hover:text-white">
                            View Contributors
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          : null}

        {/* Render placeholder elements */}
        {placeholderElements}
      </div>
    </div>
  );
};
const FundPage = ({data}) => {
  data.length === 0;

  // Defensive: handle missing or malformed data
  if (!Array.isArray(data)) return <div>No funds available.</div>;

  // Calculate how many placeholder images to show
  const actualFundsCount = data.length;
  const placeholderCount = Math.max(0, 4 - actualFundsCount);

  // Create array of placeholder elements
  const placeholderElements = Array.from(
    {length: placeholderCount},
    (_, index) => (
      <div
        key={`placeholder-${index}`}
        className={`h-[380px] mb-4 flex items-center justify-center ${
          data.length > 4 ? 'snap-start min-w-[360px] max-w-[360px]' : 'w-full'
        }`}
      >
        <Link to="/dashboard/cashfunds">
          <img
            src="/assets/Images/add-cash-placeholder.png"
            alt="Add cash fund placeholder"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    ),
  );

  const handleViewContributors = (fundName) => {
    // ...
  };

  return (
    <div className="">
      <div
        className={`${
          data.length > 4
            ? 'flex gap-[3.281vw] mt-12 pb-4 overflow-x-auto snap-x snap-mandatory'
            : 'grid gap-[3.281vw] mt-12 pb-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-hidden'
        }`}
        style={{
          scrollSnapType: data.length > 4 ? 'x mandatory' : undefined,
        }}
      >
        {data.length > 0
          ? data.map((fund) => {
              // Calculate if fund is fully gifted
              const totalAmount = Number(fund.amount) || 0;
              const collectedAmount = Number(fund.collectedAmount) || 0;
              const remainingAmount = Math.max(
                0,
                totalAmount - collectedAmount,
              );
              const isFullyGifted = remainingAmount === 0;
              const isAnyAmount = fund.cashFund?.isAnyAmount || false;

              return (
                <div
                  key={fund.productId || Math.random()}
                  className={`${
                    isFullyGifted && !isAnyAmount ? 'overlay-gifted' : ''
                  } p-4 flex flex-col justify-between ${
                    data.length > 4
                      ? 'snap-start min-w-[360px] max-w-[360px]'
                      : 'w-full'
                  }`}
                >
                  <div className="flex flex-col justify-between">
                    <div className="h-[380px] w-full mb-4 flex items-center justify-center relative">
                      <img
                        src={
                          fund.cashFund.image?.fileUrl ||
                          '/assets/Images/placeholder.png'
                        }
                        alt={fund.cashFund?.name || 'Cash Fund'}
                        className="w-full h-full object-cover mb-4"
                      />

                      <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                        <h2 className="prata text-black text-sm text-center font-bold mt-1">
                          cash <br /> fund
                        </h2>
                      </div>
                    </div>

                    <h2
                      className={`text-lg font-semibold ${
                        isFullyGifted && !isAnyAmount
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      {fund.cashFund?.name || 'No Fund Name'}
                    </h2>

                    <div className="flex justify-between items-center">
                      {!isAnyAmount && (
                        <p className="font-semibold text-md">${totalAmount}</p>
                      )}
                    </div>

                    {!isAnyAmount && (
                      <p className="text-sm italic my-2 text-right w-full mb-2 text-gray-600">
                        Remaining: ${remainingAmount}
                      </p>
                    )}

                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Contributed: ${collectedAmount.toFixed(2)} / $
                        {isAnyAmount ? 'Any Amount' : totalAmount.toFixed(2)}
                      </p>
                    </div>

                    {!isAnyAmount && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                (collectedAmount / totalAmount) * 100,
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col justify-end">
                    <div className="text-center">
                      <Link to="/dashboard/shipgifts">
                        <button className="bg-white w-full border px-4 py-4 uppercase text-sm font-semibold hover:bg-black hover:text-white">
                          View Contributors
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          : null}

        {/* Render placeholder elements */}
        {placeholderElements}
      </div>
    </div>
  );
};
