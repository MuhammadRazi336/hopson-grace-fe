import React, {useState, useRef} from 'react';
import {useFetcher, useLoaderData, useNavigate, Link, useLocation} from '@remix-run/react';
import {json, redirect} from '@shopify/remix-oxygen';
import Input from '~/components/Input';
import { Footer } from '~/components/Footer';
import AlertPortal from '~/components/AlertPortal';
import Heading from '~/components/Heading';
import headingBottomCurve from '../assets/Images/heading-bottom-curve.png';
import lineImghead from '/assets/Images/line.png';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import {formatShopifyPrice, formatPrice} from '~/utils/priceFormatter';
import { RECOMMENDED_PRODUCTS_QUERY } from '~/graphql/product-queries';
import EditImagePopup from '~/components/EditImagePopup';
import WeThinkYouLove from '~/components/WeThinkYouLove';

export async function loader(args) {
  const {context} = args;
  const user = await context?.session?.get('@User');

  // Check if user is logged in - redirect to login if not
  if (!user || !user.user || !user.user.id) {
    return redirect('/login');
  }

  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  if (!registry || !registry.data[0].id) {
    throw new Response('Registry not found in session', {status: 404});
  }

  // Fetch cash fund products (same as cash-funds page: collections with cashfund=true or category match)
  let cashFundProducts = [];
  try {
    const [{collections: collectionsData}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
    ]);
    const collections = collectionsData?.nodes || [];
    collections.forEach((collection) => {
      const titleLc = (collection?.title || '').trim().toLowerCase();
      const isCategoryMatch = titleLc.includes('honeymoon') || titleLc.includes('home') || titleLc.includes('date night') || titleLc.includes('date nights');
      const includeCollection = collection.cashfundMetafield?.value === 'true' || isCategoryMatch;
      if (includeCollection && collection.products?.edges) {
        collection.products.edges.forEach((edge) => {
          const product = edge.node;
          cashFundProducts.push({
            id: product.id,
            title: product.title,
            handle: product.handle,
            description: product.description,
            image: product.images?.edges?.[0]?.node?.url || null,
            price: product.variants?.edges?.[0]?.node?.priceV2?.amount || '0',
            currency: product.variants?.edges?.[0]?.node?.priceV2?.currencyCode || 'USD',
            availableForSale: product.variants?.edges?.[0]?.node?.availableForSale || false,
            collectionId: collection.id,
            collectionTitle: collection.title,
          });
        });
      }
    });
  } catch (error) {
    console.error('Error fetching cash fund collections:', error);
  }

  // Fetch recommended products (fallback when no cash fund products)
  let recommendedProducts = [];
  try {
    const { products: recommendedProductsData } = await context.storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: { first: 8 },
    });
    recommendedProducts = recommendedProductsData?.edges || [];
  } catch (error) {
    console.error('Error loading recommended products:', error);
  }

  return {registry, recommendedProducts: recommendedProducts || [], cashFundProducts: cashFundProducts || []};
}

export async function action({request, context}) {
  const formData = await request.formData();
  
  try {
    const response = await context.ClientPost(
      formData,
      'registryProducts/cash-fund',
      context,
      {
        headers: {
          // Don't set Content-Type header, it will be automatically set with boundary
          // when sending FormData
        },
      }
    );
    return json({response, success: true});
  } catch (e) {
    return json({error: e.message || 'Failed to create cash fund', success: false});
  }
}

function CreateNewCashFund() {
  const {registry, recommendedProducts, cashFundProducts} = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cashFundName, setCashFundName] = useState('');
  const [allowFixedAmount] = useState(true);
  const [totalGoal, setTotalGoal] = useState('');
  const [hideFromGuests, setHideFromGuests] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [noteToFamily, setNoteToFamily] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const fetcher = useFetcher();
  const formRef = useRef(null);

  // Handle cropped image save from popup
  const handleCroppedImageSave = async (croppedBlob) => {
    if (!croppedBlob) {
      toast.warn('No image to upload');
      return;
    }

    try {
      // Create a file object from the blob
      const file = new File([croppedBlob], 'cashfund-image.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Image selected successfully!');
    } catch (err) {
      console.error('Error processing cropped image:', err);
      toast.error('Error processing image');
    } finally {
      setIsEditPopupOpen(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Open the cropping popup instead of directly setting the preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        // We'll pass the file data to the popup
        setPhotoFile(file);
        setIsEditPopupOpen(true);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // const handleCroppedImageSave = (blob) => {
  //   if (!blob) return;
  //   const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
  //   setPhotoFile(file);
  //   setPhotoPreview(URL.createObjectURL(blob));
  //   setIsEditPopupOpen(false);
  // };

  const handleDragOverPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage('File size must be less than 5MB');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }
      setDroppedFile(file);
      setIsEditPopupOpen(true);
    }
  };

  // Show feedback on fetcher.data change and redirect on success
  React.useEffect(() => {
    // Only process when fetcher is idle (submission complete) and we have data
    if (fetcher.state === 'idle' && fetcher.data) {
      // Check for success response
      if (fetcher.data?.success === true || fetcher.data?.response) {
        setAlertMessage('Cash fund has been created and added to your registry!');
        setAlertType('success');
        setShowAlert(true);
        // Redirect to registry home page after showing success message for 2 seconds
        const redirectTimer = setTimeout(() => {
          navigate('/dashboard/registry');
        }, 2000);
        
        // Cleanup timer on unmount
        return () => clearTimeout(redirectTimer);
      } else if (fetcher.data?.error || fetcher.data?.success === false) {
        setAlertMessage(fetcher.data?.error || 'Failed to create cash fund. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
      }
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleFormSubmit = (e) => {
    if (!agreedToTerms) {
      e.preventDefault();
      setAlertMessage('You must agree to the terms and conditions.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }
    const isMissingRequiredFields = !cashFundName || !registry?.data[0]?.id || !totalGoal;
    if (isMissingRequiredFields) {
      e.preventDefault();
      setAlertMessage('Please fill in all required fields.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }
    // Build FormData so we can include photo from modal (cropped blob as File)
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    if (photoFile) {
      formData.set('file', photoFile);
    }
    fetcher.submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };

  return (
    <>
      <div className="w-full h-fit pt-[5.313vw] max-[767px]:px-[20px] max-[767px]:pt-[50px]">
        <Heading
          text="cash & travel funds"
          classes={
            'prata text-[38px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal m-0 text-center max-[1024px]:m-0 max-[767px]:text-[30px]'
          }
          image={headingBottomCurve}
          imageClasses={'max-[1024px]:max-w-[330px] max-[767px]:max-w-[250px] lg:w-[20.833vw] xl:w-[20.833vw] 2xl:w-[20.833vw] lg:h-[6px] xl:h-[6px] 2xl:h-[6px]'}
        />
        <p className="text-center tracking-[0.1vw] my-[1.823vw] font-[500] text-[20px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] max-[767px]:my-[20px] max-[767px]:text-[18px]">
          ASK FOR WHAT YOU REALLY WANT
        </p>
        <p className="text-center text-[16px] max-[767px]:w-[90%] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] font-normal w-[80%] lg:w-[57.604vw] xl:w-[57.604vw] 2xl:w-[57.604vw] mx-auto">
          From once-in-a-lifetime adventures to future home dreams, our Cash & Travel Funds let you register for the big stuff. Choose a pre-made fund, create your own, or work with Porte Travel to create a custom trip that's so you. Because life together should start with something unforgettable.
        </p>
      </div>

      <div className="w-full flex flex-row justify-center items-center gap-[1.25vw] mt-[3.906vw] mb-[5.833vw] px-4 md:px-16 max-[767px]:flex-wrap max-[767px]:gap-[10px]">
        <div
          className={`fund-tabs max-[1024px]:text-[16px] max-[767px]:text-[14px] max-[1024px]:px-[20px] max-[1024px]:w-auto max-[1024px]:h-[50px] bastardogrotesk font-[800] uppercase w-[13.229vw] h-[3.125vw] border-2 flex items-center justify-center text-[0.833vw] leading-[1.042vw] tracking-[0.067vw] ${
            location.pathname === '/dream-fund'
              ? 'bg-[#1F1D1B]'
              : ''
          }`}
        >
          <Link to="/dream-fund" className={`${
            location.pathname === '/dream-fund'
              ? 'text-white'
              : 'text-[#1F1D1B]'
          }`}>Dream Funds</Link>
        </div>
        <div
          className={`fund-tabs max-[1024px]:text-[16px] max-[767px]:text-[14px] max-[1024px]:px-[20px] max-[1024px]:w-auto max-[1024px]:h-[50px] bastardogrotesk font-[800] uppercase w-[13.229vw] h-[3.125vw] border-2 flex items-center justify-center text-[0.833vw] leading-[1.042vw] tracking-[0.067vw] ${
            location.pathname.startsWith('/dashboard/cashfunds/create-new')
              ? 'bg-[#1F1D1B]'
              : ''
          }`}
        >
          <Link to="/dashboard/cashfunds/create-new" className={`${
            location.pathname.startsWith('/dashboard/cashfunds/create-new')
              ? 'text-white'
              : 'text-[#1F1D1B]'
          }`}>Create Your Own</Link>
        </div>
        <div
          className={`fund-tabs max-[1024px]:text-[16px] max-[767px]:text-[14px] max-[1024px]:px-[20px] max-[1024px]:w-auto max-[1024px]:h-[50px] bastardogrotesk font-[800] uppercase w-[13.229vw] h-[3.125vw] border-2 flex items-center justify-center text-[0.833vw] leading-[1.042vw] tracking-[0.067vw] ${
            location.pathname.startsWith('/porte-travel')
              ? 'bg-[#1F1D1B]'
              : ''
          }`}
        >
          <Link to="/porte-travel" className={`${
            location.pathname.startsWith('/porte-travel')
              ? 'text-white'
              : 'text-[#1F1D1B]'
          }`}>Porte Travel</Link>
        </div>
      </div>

      <div className="w-full h-[30vw] flex flex-row items-center justify-center max-[1024px]:h-[350px] max-[767px]:flex-col max-[767px]:h-auto">
        <div className="w-[50%] h-full bg-[#F5F2ED] relative max-[767px]:w-full">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%] max-[767px]:w-full max-[767px]:relative max-[767px]:translate-x-0 max-[767px]:translate-y-0 max-[767px]:top-0 max-[767px]:left-0 max-[767px]:py-[30px]">
            <Heading
              text={'create your own'}
              classes={
                'prata text-[34px] lg:text-[2.292vw] xl:text-[2.292vw] 2xl:text-[2.292vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 text-black max-[767px]:text-[30px]'
              }
              image={lineImghead}
              imageClasses={'w-[150px] lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw] lg:h-[0.417vw] xl:h-[0.417vw] 2xl:h-[0.417vw]'}
            />
            <p className="text-[16px] max-[767px]:w-[90%] sm:text-lg lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] w-[29.844vw] lg:max-w-full lg:leading-[2.083vw] xl:leading-[2.083vw] 2xl:leading-[2.083vw] text-black leading-relaxed mx-auto mt-[1.823vw] max-[1024px]:w-[80%]">
            Got your eye on a Belgian sofa for your new condo? Planning a surf trip in Costa Rica? <br className="max-[767px]:hidden" />Set up a fund for literally anything—this one’s all you.
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full max-[767px]:w-full">
          <img
            src={'/assets/Images/create-your-own.jpg'}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

    <div className="pt-[7.356vw] pb-[15.16vw] px-[9.18vw]">
        <div className="pt-[9.63vw] pb-[5.143vw] px-[7.356vw] bg-[#446184]">
          {/* <h2 className="mt-0 text-white ivyora lg:text-[2.083vw] text-[24px] prata text-center lg:leading-[1.875vw] font-normal mb-[1.667vw]">
            <span className="prata uppercase">NEW CASH</span> or{' '}
            <span className="prata uppercase">TRAVEL</span> fund
          </h2>
          <img
            src="/assets/Images/new-cash-bdr.png"
            alt="Create New Cash Fund"
            className="max-w-[630px] lg:w-[39.219vw] lg:h-[0.417vw] mt-0 h-auto mx-auto max-[767px]:max-w-[300px]"
          />

          <p className="w-[46.927vw] max-w-full mb-[5.26vw] text-[26px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] mx-auto text-center text-white mt-5 font-normal leading-relaxed max-[767px]:text-[18px] max-[767px]:w-[90%]">
            Create your own custom cash fund for anything you dream of - from honeymoon adventures to home improvements. 
            Design it exactly how you want it and share it with your loved ones.
          </p> */}

          <div className="w-full mx-auto">
            <fetcher.Form ref={formRef} method="post" encType="multipart/form-data" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3.49vw]">
                {/* Photo Section */}
                <div className="space-y-4 lg:w-[41.08vw] xl:w-[41.08vw] 2xl:w-[41.08vw]">
                  <h2 className="text-white text-[16px] mb-[1.042vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold tracking-[2px]">
                  UPLOAD YOUR OWN PHOTO OR KEEP THIS
                  </h2>
                  <div
                    className="bg-[#F5F2ED] aspect-square relative flex items-center justify-center w-full h-[41.08vw] border-2 border-dashed border-transparent hover:border-gray-300 transition-colors"
                    onDragOver={handleDragOverPhoto}
                    onDrop={handleDropPhoto}
                  >
                    <div className="text-center w-full h-full flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Cash Fund"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/assets/Images/registrylogoSteps.png"
                          alt="Cash Fund"
                          className="w-[16.042vw] object-cover"
                        />
                      )}
                    </div>
                    <button
                      className="cursor-pointer"
                      type="button"
                      onClick={() => !isPhotoUploading && setIsEditPopupOpen(true)}
                    >
                      <div className="absolute -top-6 -right-4 size-[5.938vw] flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50">
                        <img
                          src="/assets/Images/edit-icon.png"
                          alt="edit"
                          className={`w-auto h-auto ${isPhotoUploading ? 'opacity-50' : ''}`}
                        />
                        {isPhotoUploading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  <EditImagePopup
                    isOpen={isEditPopupOpen}
                    onClose={() => {
                      setIsEditPopupOpen(false);
                      setDroppedFile(null);
                    }}
                    onSave={handleCroppedImageSave}
                    initialFile={droppedFile}
                    onInitialFileConsumed={() => setDroppedFile(null)}
                    cropShape="rect"
                  />
                </div>

                {/* Details Section */}
                <div className="space-y-6 lg:w-[44.14vw] xl:w-[44.14vw] 2xl:w-[44.14vw]">
                  <h2 className="text-white text-[16px] mb-[1.042vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold tracking-[2px]">
                    GIFT NAME
                  </h2>

                  <div className="rounded-lg">
                    <div className="w-full">
                      <Input
                        id="cashFundName"
                        name="name"
                        value={cashFundName}
                        className="bg-white lg:text-[0.938vw] font-bold uppercase w-full p-4 !m-0 h-[4.271vw] max-[767px]:text-[16px] max-[767px]:px-[15px] max-[767px]:h-[50px] max-[767px]:py-0 placeholder:bg[#948E8A] placeholder:normal-case placeholder:font-normal "
                        placeholder="e.g., Honeymoon fund, renovation"
                        onChange={(e) => setCashFundName(e.target.value)}
                      />
                    </div>

                    {/* Fixed Amount Label */}
                    {/* <div className="flex mt-[1.7vw] gap-4 lg:gap-[1.042vw] mb-[6.354vw] items-center justify-center max-[767px]:mt-[20px] max-[767px]:mb-[40px]">
                      <span className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wide text-center">
                        FIXED <br /> AMOUNT
                      </span>
                    </div> */}

                    <h2 className="text-white mt-[3.594vw] text-[16px] mb-[1.042vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold tracking-[2px]">
                      GIFT VALUE
                    </h2>

                    <div className="flex items-center justify-between max-[600px]:flex-col max-[600px]:gap-[10px]">
                      {/* Total Goal Input */}
                      <div className="w-7/12 max-[600px]:w-full">
                        <Input
                          id="totalGoal"
                          name="amount"
                          value={totalGoal}
                          className="bg-white w-full !m-0 p-4 text-lg h-[4.271vw] max-[767px]:text-[16px] max-[767px]:px-[15px] max-[767px]:h-[50px] max-[767px]:py-0 placeholder:normal-case placeholder:font-normal"
                          placeholder="Total Goal*"
                          onChange={(e) => setTotalGoal(e.target.value)}
                        />
                      </div>

                      {/* Hide from Guests Toggle */}
                      <div className=" flex items-center justify-center gap-5 lg:gap-[1.042vw] w-5/12 pl-2">
                        <span className="text-white text-[16px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold text-center tracking-[2px]">
                          HIDE <br /> FROM <br /> GUESTS
                        </span>

                        <button
                          type="button"
                          onClick={() => setHideFromGuests(!hideFromGuests)}
                          className={`flex items-center gap-2 h-[4.167vw] min-h-[40px] w-[4.167vw] min-w-[40px] px-4 py-4 rounded-full text-xs font-medium tracking-colors max-[767px]:h-[40px] max-[767px]:w-[40px] max-[767px]:p-1 ${
                            hideFromGuests
                              ? 'bg-[#223247] text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {hideFromGuests ? (
                            <img
                              src="/assets/Images/check-icon.png"
                              alt="check"
                              className="w-[1.875vw] h-[1.875vw] mx-auto max-[767px]:w-[20px] max-[767px]:h-[20px]"
                            />
                          ) : (
                            <span className="w-[1.875vw] h-[1.875vw]">&nbsp;</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-3 mt-[4.531vw]">
                      <h4 className="text-white mt-0 mb-[1.094vw] font-bold text-[16px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] tracking-[2px]">
                        TERMS & CONDITIONS
                      </h4>
                      <p className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[28px] ivyora italic font-[400] tracking-[2px]">
                        By creating this cash fund, you agree to our terms and conditions. 
                        This fund will be added to your registry and shared with your guests.
                      </p>
                      <div className="flex items-center space-x-2 mt-[15px]">
                        <span className="text-white text-[14px] lg:text-[0.729vw] lg:leading-[0.938vw] mr-[0.8vw] font-bold text-center tracking-[2px]">
                          AGREE
                        </span>

                        <button
                          type="button"
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                          className={`flex items-center gap-2 h-[32px] w-[32px] lg:h-[1.667vw] lg:w-[1.667vw] rounded-full text-xs font-medium tracking-wide transition-colors ${
                            agreedToTerms
                              ? 'bg-[#223247] text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {agreedToTerms ? (
                            <img
                              src="/assets/Images/check-icon.png"
                              alt="check"
                              className="w-4 h-4 mx-auto"
                            />
                          ) : (
                            <span className="w-4 h-4 mx-auto">&nbsp;</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Section */}
              <div className="mt-[3.542vw] space-y-4">
                <h2 className="text-white mt-[3.594vw] text-[16px] mb-[1.042vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold tracking-wide">
                  DESCRIPTION
                </h2>
                <textarea
                  placeholder="Write a short note to friends and family — explaining what this fund is for and why it's important to you (optional)."
                  name="note"
                  value={noteToFamily}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setNoteToFamily(e.target.value);
                    }
                  }}
                  maxLength={500}
                  className="w-full h-[14.375vw] mb-[0.938vw] p-[2.344vw] text-[24px] lg:text-[1.25vw] lg:leading-[1.563vw] bg-white resize-none border-none outline-none max-[767px]:text-[16px] max-[767px]:p-[15px] max-[767px]:h-[100px]"
                />
                <p className={`ivyora text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] m-0 italic tracking-wide font-[400] ${
                  (500 - noteToFamily.length) < 50 ? 'text-[#FD446F]' : 'text-[#FFFCFC]'
                }`}>
                  {500 - noteToFamily.length}/500 characters remaining
                </p>
              </div>

              <input type="hidden" name="isFixedAmount" value="true" />
              <input type="hidden" name="isAmountHide" value={hideFromGuests ? 'true' : 'false'} />
              <input type="hidden" name="registryId" value={registry?.data[0]?.id || ''} />

              {/* Create Cash Fund Button */}
              <div className="mt-[1.875vw] flex justify-end">
                <button
                  className="bg-white font-bold text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer hover:bg-gray-100 text-black tracking-wide w-[360px] h-[77px] lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-black"
                  disabled={!agreedToTerms || fetcher.state === 'submitting'}
                  type="submit"
                >
                  {fetcher.state === 'submitting' ? 'Adding Cash Fund...' : 'ADD TO REGISTRY'}
                </button>
              </div>
            </fetcher.Form>

            {/* Alert Component - Rendered outside app-scale via portal */}
            {showAlert && (
              <AlertPortal>
                <div
                  className={`success-alert-popup fixed bottom-4 right-4 ${
                    alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
                  } text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in-out`}
                  style={{ 
                    position: 'fixed', 
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    maxWidth: 'calc(100vw - 2rem)'
                  }}
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
              </AlertPortal>
            )}
          </div>
        </div>
      </div>

      <WeThinkYouLove recommendedProducts={recommendedProducts} />

      <Footer />
      
      {/* Image Edit Popup */}
      <EditImagePopup
        isOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
        onSave={handleCroppedImageSave}
        cropShape="rect"
      />
      
      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
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
      `}</style>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query {
    collections(first: 250) {
      nodes {
        description
        title
        id
        image {
          id
          url
          altText
          width
          height
        }
        cashfundMetafield: metafield(namespace: "custom", key: "cashfund") {
          id
          value
        }
        products(first: 10){
          edges {
            node {
              id
              title
              handle
              description
              images(first: 10) {
                edges {
                  node {
                    id
                    url
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
          }
        }
      }
    }
  }
`;

export default CreateNewCashFund;
