import Accordiance from '~/components/Accordiance.jsx';
import {defer} from '@remix-run/server-runtime';
import {Link, useLoaderData, json} from '@remix-run/react';
import {fetchProducts} from '~/graphql/product-query/GetProductsQuery';
import EditImagePopup from '~/components/EditImagePopup';
import EditBackgroundImagePopup from '~/components/EditBackgroundImagePopup';
import {useState, useRef, useEffect} from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegistryStatusCard from '~/components/RegistryStatusCard';
import PreviewRegistry from '~/components/PreviewRegistry';
import { Footer } from '~/components/Footer';
import {formatPrice} from '~/utils/priceFormatter';

// Collections with products per node (same approach as addgifts: parent -> sub -> products -> parentCollectionId)
const REGISTRY_COLLECTION_QUERY = `#graphql
  query RegistryCollectionsWithProducts {
    collections(first: 250) {
      nodes {
        id
        title
        parentMetafield: metafield(namespace: "parent", key: "collection") {
          id
          value
        }
        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
        subMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
        subCollectionMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
          references(first: 50) {
            edges {
              node {
                ... on Collection {
                  id
                }
              }
            }
          }
        }
        products(first: 50) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }`;

// Fallback: get each product's collections so we can resolve parentCollectionId when product isn't in collection.products
const REGISTRY_PRODUCT_COLLECTIONS_QUERY = `#graphql
  query RegistryProductCollections($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        collections(first: 50) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }`;

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

  const ids = res?.data?.map(
    (product) => `gid://shopify/Product/${product.productId}`,
  ) || [];
  const productsResult = await fetchProducts(context.storefront, ids);
  const products = productsResult || {nodes: []};
  const productNodes = Array.isArray(products.nodes) ? products.nodes : [];

  let mergedArray = [];
  const apiBaseUrl = context.env?.API_BASE_URL || 'https://dev-hopsongrace.codup.io';

  // Fetch collections and build productId -> parentId (and subCollectionId -> parentId) for merging parentCollectionId onto registry gifts
  let parentCollections = [];
  const productIdToParentId = {};
  const subCollectionIdToParentId = {};
  const productIdToCollectionIds = {}; // from collection query: which sub-collections each product appeared in
  try {
    const {collections} = await context.storefront.query(REGISTRY_COLLECTION_QUERY);
    const collectionsList = collections?.nodes || [];
    const isExcludedFundsCollection = (col) => {
      const t = (col.title && String(col.title).toUpperCase().trim()) || '';
      return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
    };
    const isParentForSlides = (col) =>
      col.parentMetafield?.value === 'true' &&
      col.readyMadeMetafield?.value !== 'true' &&
      !isExcludedFundsCollection(col);
    parentCollections = collectionsList.filter(isParentForSlides);
    // Sort by id so order is deterministic and "first parent wins" matches addgifts (e.g. Tableware 283241316451 before 288315506787)
    parentCollections = [...parentCollections].sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    // Identical to addgifts: for each parent -> sub-collections -> products; first parent that contains product wins (if (!productMap.has(product.id)))
    for (const parentCollection of parentCollections) {
      let subCollectionGids = [];
      let subCollections = [];
      if (parentCollection.subCollectionMetafield?.references?.edges) {
        subCollections = parentCollection.subCollectionMetafield.references.edges.map(
          (edge) => edge.node,
        );
        subCollectionGids = subCollections.map((sub) => sub.id);
      } else if (parentCollection.subMetafield?.value) {
        try {
          subCollectionGids = JSON.parse(parentCollection.subMetafield.value);
          subCollections = collectionsList.filter(
            (col) =>
              col.parentMetafield?.value === 'false' &&
              col.readyMadeMetafield?.value !== 'true' &&
              subCollectionGids.includes(col.id),
          );
        } catch (e) {
          console.error('Error parsing subMetafield in registry loader:', e);
        }
      }
      for (const subRef of subCollections) {
        const subId = subRef?.id;
        if (subId) subCollectionIdToParentId[subId] = parentCollection.id;
        const subCollection =
          collectionsList.find((col) => col.id === subId) || subRef;
        if (subCollection?.products?.edges) {
          for (const edge of subCollection.products.edges) {
            const productId = edge?.node?.id;
            if (productId) {
              if (productIdToParentId[productId] === undefined) {
                productIdToParentId[productId] = parentCollection.id;
              }
              if (!productIdToCollectionIds[productId]) productIdToCollectionIds[productId] = [];
              if (!productIdToCollectionIds[productId].includes(subId)) {
                productIdToCollectionIds[productId].push(subId);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching collections for registry:', err);
  }

  // Fallback: if registry product wasn't in collection query (e.g. not in first 50 products), get its collections from Storefront
  if (ids?.length > 0) {
    try {
      const productCollectionsResult = await context.storefront.query(
        REGISTRY_PRODUCT_COLLECTIONS_QUERY,
        {variables: {ids}},
      );
      const nodes = productCollectionsResult?.nodes || [];
      nodes.forEach((node) => {
        if (node?.id && node?.collections?.edges) {
          const list = node.collections.edges.map((e) => e?.node?.id).filter(Boolean);
          if (list.length && !productIdToCollectionIds[node.id]) {
            productIdToCollectionIds[node.id] = list;
          }
        }
      });
    } catch (err) {
      console.error('Error fetching product collections for registry fallback:', err);
    }
  }

  // Merge: API parentCollectionId (normalized), then productIdToParentId (same as addgifts), then resolve via productIdToCollectionIds + subCollectionIdToParentId for products not seen in collection query
  if (res?.data?.length && productNodes.length > 0) {
    mergedArray = res.data.map((item1) => {
      const product = productNodes.find(
        (item2) =>
          item2 && item2.id === `gid://shopify/Product/${item1.productId}`,
      );
      const amount =
        item1.amount !== undefined ? Number(item1.amount) : undefined;
      const collectedAmount =
        item1.collectedAmount !== undefined
          ? Number(item1.collectedAmount)
          : undefined;
      let parentCollectionId = item1.parentCollectionId;
      if (parentCollectionId != null && typeof parentCollectionId !== 'string') {
        parentCollectionId = `gid://shopify/Collection/${parentCollectionId}`;
      } else if (typeof parentCollectionId === 'string' && !parentCollectionId.startsWith('gid://')) {
        parentCollectionId = `gid://shopify/Collection/${parentCollectionId}`;
      }
      if (parentCollectionId == null && product?.id) {
        parentCollectionId = productIdToParentId[product.id];
        if (parentCollectionId == null) {
          const collectionIds = productIdToCollectionIds[product.id] || [];
          for (const cid of collectionIds) {
            if (subCollectionIdToParentId[cid]) {
              parentCollectionId = subCollectionIdToParentId[cid];
              break;
            }
          }
        }
      }
      if (product) {
        return {
          ...item1,
          ...product,
          amount,
          collectedAmount,
          parentCollectionId: parentCollectionId ?? product.parentCollectionId,
        };
      }
      return {
        ...item1,
        amount,
        collectedAmount,
        parentCollectionId,
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

  // Browser console: verify registry data
  useEffect(() => {
    const gifts = Array.isArray(data) ? data : [];
    console.log('[Registry Dashboard] gifts (data):', gifts.length);
    console.log('cashfundData', cashfundData);
  }, [data, cashfundData]);

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
        toast.success('Message updated!');
      } else {
        console.log('response', response);
        toast.error(response.statusText || 'Error updating message');
      }
    } catch (err) {
      toast.error('Error updating message');
    }
  };

  // Handle cropped image save from popup
  const handleCroppedImageSave = async (croppedBlob) => {
    if (!croppedBlob) {
      toast.warn('No image to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile.jpg');

      const response = await fetch(
        `${finalApiBaseUrl}/api/events/${registryData?.events?.[0]?.id}/image`,
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
        console.log('Upload response:', data);

        // Update the event image state (matching handleBackgroundImageSave pattern)
        if (data.data && data.data.image) {
          const newImageUrl = data.data.image.fileUrl || data.data.image;
          // Use blob URL instead of potentially broken S3 URL
          // The blob URL will work immediately while S3 URL might be 404
          const blobUrl = URL.createObjectURL(croppedBlob);
          setEventImage(blobUrl);
          toast.success('Profile image updated successfully!');
        } else {
          // Fallback to blob URL for immediate display (same as handleBackgroundImageSave)
          const blobUrl = URL.createObjectURL(croppedBlob);
          setEventImage(blobUrl);
          toast.success('Profile image updated!');
        }
      } else {
        // Even on error, use blob URL for immediate display
        const blobUrl = URL.createObjectURL(croppedBlob);
        setEventImage(blobUrl);
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        toast.success('Profile image updated! (Using temporary preview)');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      // Even on error, use blob URL for immediate display
      const blobUrl = URL.createObjectURL(croppedBlob);
      setEventImage(blobUrl);
      toast.success('Profile image updated! (Using temporary preview)');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle background image save from popup
  const handleBackgroundImageSave = async (croppedBlob) => {
    if (!croppedBlob) {
      toast.warn('No background image to upload');
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

        // Update the background image state (matching handleCroppedImageSave pattern)
        if (data.data && data.data.backgroundImage) {
          const newBackgroundUrl = data.data.backgroundImage.fileUrl || data.data.backgroundImage;
          // Use blob URL instead of potentially broken S3 URL
          // The blob URL will work immediately while S3 URL might be 404
          const blobUrl = URL.createObjectURL(croppedBlob);
          setBackgroundImage(blobUrl);
          toast.success('Background image updated successfully!');
        } else {
          // Fallback to blob URL for immediate display (same as handleCroppedImageSave)
          const blobUrl = URL.createObjectURL(croppedBlob);
          setBackgroundImage(blobUrl);
          toast.success('Background image updated!');
        }
      } else {
        // Even on error, use blob URL for immediate display
        const blobUrl = URL.createObjectURL(croppedBlob);
        setBackgroundImage(blobUrl);
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Background upload failed:', errorData);
        toast.success('Background image updated! (Using temporary preview)');
      }
    } catch (err) {
      console.error('Error uploading background image:', err);
      toast.error('Error updating background image. Please try again.');
    } finally {
      setIsBackgroundUploading(false);
    }
  };

  // Filters for "our registry selections"
  const [priceSort, setPriceSort] = useState('low-to-high'); // 'low-to-high' | 'high-to-low'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'gifted' | 'ungifted'
  // Category filter: 'all' | 'gifts' | 'cashfunds' — which section(s) to show (Gifts div and/or Cash Funds div)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openFilter, setOpenFilter] = useState(null); // null | 'category' | 'price' | 'status'
  const filterRef = useRef(null);

  const categoryLabel =
    categoryFilter === 'all'
      ? 'All'
      : categoryFilter === 'gifts'
        ? 'Gifts'
        : categoryFilter === 'cashfunds'
          ? 'Cash Funds'
          : 'All';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterTriggerClass =
    'text-[18px] uppercase flex gap-[10px] items-center lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.938vw] xl:leading-[1.938vw] 2xl:leading-[1.938vw] cursor-pointer border-0 bg-transparent p-0 font-inherit';
  const Arrow = ({ isOpen }) => (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
      <path d="M7.06524 10.5C6.68034 11.1667 5.71809 11.1667 5.33319 10.5L0.13704 1.5C-0.24786 0.833333 0.233266 0 1.00307 0L11.3954 0C12.1652 0 12.6463 0.833333 12.2614 1.5L7.06524 10.5Z" fill="black"/>
    </svg>
  );

  return (
    <>
      <div className="flex justify-between mt-[2.865vw] max-[1024px]:flex-wrap max-[1024px]:mt-[50px] max-[1024px]:px-[20px]">
        <div className="flex-1 lg:ml-[15.625vw] max-[1024px]:w-full max-[1024px]:mx-auto">
          <div className="text-center">
            <h2 className="mt-[2.708vw] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] ivyora lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal mb-[1.771vw] max-[1024px]:mt-0">
              <span className="prata uppercase">My registry</span> homepage
            </h2>

            <svg className='mx-auto lg:w-[39.219vw] xl:w-[39.219vw] 2xl:w-[39.219vw] max-[1024px]:w-[70%]' width="757" height="10" viewBox="0 0 757 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.83965C181.526 3.83965 361.053 3.83965 540.579 3.83965C595.616 3.83965 650.652 3.83965 705.689 3.83965C714.879 3.83965 750.471 -2.35887 755 8" stroke="#1F1D1B" stroke-width="3" stroke-linecap="round"/>
            </svg>

            <p className="max-w-[43.958vw] text-[#1F1D1B] mx-auto mt-[2.031vw] text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] max-[1024px]:w-[100%] max-[1024px]:max-w-full max-[1024px]:text-[16px] max-[1024px]:mb-[20px]">
              Your guests will land here—so have fun with it! <br className='max-[1024px]:hidden' />Leave them a
              message and upload your photos or video, or pick from our
              <br className='max-[1024px]:hidden' />illustrations to create something uniquely you.
            </p>
          </div>
        </div>

        <div className="w-[300px] flex flex-col gap-y-4 max-[1024px]:w-full">
        
<Link to={`/couple/single/${registryData?.userId}`}>
          <div className="w-[260px] min-h-[100px] bg-[#F5F2ED] z-10 max-[1024px]:w-full">
            <div className="container mx-auto pt-5 flex items-center justify-center flex-col">
              <img
                src="/assets/Images/share-icon.png"
                alt="preview"
                className="w-10 mx-auto filter brightness-0 lg:w-[1.875vw] xl:w-[1.875vw] 2xl:w-[1.875vw] mb-[1.146vw]"
              />
              <h2 className="text-black text-sm text-center font-bold m-0 lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw]">
                PREVIEW PAGE
              </h2>
            </div>
          </div>
          </Link>

          <div>
            <RegistryStatusCard
              status={registryData?.status}
              registryId={registryData?.id}
              token={user?.accessToken}
            />
          </div>
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
      <div className="text-center pt-[4.115vw] px-[3.281vw] mx-auto font-sans max-[1024px]:pt-[50px] max-[1024px]:px-[20px]">
        <div className="relative">
          <div
            className="w-full h-[400px] lg:h-[32.292vw] xl:h-[32.292vw] 2xl:h-[32.292vw] bg-[#446184] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            }}
          >
          </div>
          <div
            className="absolute top-[2.396vw] right-[2.396vw] cursor-pointer w-[4vw] h-[4vw]"
            onClick={() =>
              !isBackgroundUploading && setIsBackgroundEditPopupOpen(true)
            }
          >
            <div className="bg-white rounded-full p-0 shadow-lg hover:bg-gray-50 max-[1024px]:p-1">
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

        <div className="flex flex-wrap lg:flex-nowrap xl:flex-nowrap 2xl:flex-nowrap justify-center items-start -mb-10 lg:-translate-y-[200px] xl:-translate-y-[200px] 2xl:-translate-y-[200px] ">
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px] flex justify-end max-[1024px]:mt-[20px] pr-[40px]">
            <h1 className="lg:text-[3.2vw] xl:text-[3.2vw] 2xl:text-[3.2vw] lg:leading-[3.7vw] xl:leading-[3.7vw] 2xl:leading-[3.7vw] my-2 max-w-[340px] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto max-[1024px]:mb-[20px] lowercase">
              {userGet?.data?.user?.firstName} &{' '}<br />
              {userGet?.data?.user?.fianceFirstName}
            </h1>
          </div>
          <div className="lg:w-[30vw] xl:w-[30vw] 2xl:w-[30vw] lg:min-w-[30vw] xl:min-w-[30vw] 2xl:min-w-[30vw] lg:min-h-[30vw] xl:min-h-[30vw] 2xl:min-h-[30vw] lg:h-[30vw] xl:h-[30vw] 2xl:h-[30vw]  w-full">
            <div className="relative w-full h-full">
              {(() => {
                // Check if we have a valid image URL
                const hasValidImage = eventImage && 
                                     typeof eventImage === 'string' && 
                                     eventImage.trim() !== '' && 
                                     eventImage !== '/assets/Images/couple-placeholder.png';
                
                // Debug log
                console.log('eventImage value:', eventImage, 'hasValidImage:', hasValidImage);
                
                return (
                  <>
                    {!hasValidImage && (
                      <div className='placeholders flex flex-col items-center justify-center absolute inset-0 z-[20] pointer-events-none'>
                        <img 
                          src="/assets/Images/copyrightLogo.png" 
                          alt='placeholder' 
                          className='w-[8vw] h-[7.5vw] brightness-0 object-contain' 
                          onError={(e) => console.error('Failed to load copyrightLogo.png', e)}
                          onLoad={() => console.log('copyrightLogo.png loaded successfully')}
                        />
                        <img 
                          src="/assets/Images/placeholder-line.png" 
                          alt='placeholder' 
                          className='object-contain w-[16.042vw] h-[4px] mt-2' 
                          onError={(e) => console.error('Failed to load placeholder-line.png', e)}
                          onLoad={() => console.log('placeholder-line.png loaded successfully')}
                        />
                      </div>
                    )}
                    
                    {hasValidImage ? (
                      <img
                        src={eventImage}
                        alt="Couple"
                        className="rounded-full bg-[#F5F2ED] xl:w-full xl:h-full h-[300px] w-[300px] mx-auto object-cover relative z-[1]"
                        onError={(e) => {
                          console.error('Failed to load event image:', eventImage);
                          // If image fails to load, we should show placeholder
                          setEventImage(null);
                        }}
                      />
                    ) : (
                      <div className="rounded-full bg-[#F5F2ED] xl:w-full xl:h-full h-[300px] w-[300px] mx-auto relative z-[1]"></div>
                    )}
                  </>
                );
              })()}
              <div
                className="absolute -bottom-[1.604vw] left-[50%] translate-x-[-50%] w-[4vw] h-[4vw] z-1"
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
          <div className="lg:w-[calc(100% - 36.979vw)] w-full mt-[250px] max-[1024px]:mt-[30px] pl-[40px]">
            <div className="mr-16">
              <p className="lg:text-[2vw] xl:text-[2vw] 2xl:text-[2vw] text-right my-2 lg:leading-[2.3vw] xl:leading-[2.3vw] 2xl:leading-[2.3vw] prata ml-auto">
                {eventGet?.data?.eventDate}
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[16.219vw] h-auto ml-auto max-[1024px]:mb-[50px]"
              />
              <div className="uppercase text-right ">
                {eventGet?.data?.location && (
                <p className="text-lg my-1">{eventGet?.data?.location}</p>
                )}
                {eventGet?.data?.province && (
                  <p className="text-lg my-1">
                    {eventGet?.data?.province}{eventGet?.data?.city && ', '} {eventGet?.data?.city}
                  </p>
                )}
                {eventGet?.data?.weddingTime && (
                  <p className="text-lg my-1">{eventGet?.data?.weddingTime}</p>
                )}
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
          <div className="flex justify-between items-center mt-2 max-[1024px]:flex-wrap max-[1024px]:justify-start">
            <span className="text-sm italic text-gray-400 max-[1024px]:w-full">
              {maxLength - note.length}/{maxLength} characters remaining
            </span>
            <button
              className="uppercase font-bold text-gray-500 border-b-2 border-gray-400 tracking-wider text-sm px-2 py-1 max-[1024px]:text-[14px] max-[1024px]:mx-[10px]"
              onClick={handleSavePreview}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto w-[calc(100%-13.3vw)] pt-[4.427vw] pb-[9vw] px-[3.906vw] bg-[#FAF9F6] max-[1024px]:w-full max-[1024px]:px-[20px]">
        <h2 className="mt-0 lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] prata text-center lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal mb-[1.302vw]">
          your registry selections
        </h2>
        <img
          src="/assets/Images/heading-bottom-curve.png"
          alt="Couple"
          className="max-w-[630px] h-auto mx-auto lg:w-[33.021vw] xl:w-[33.021vw] 2xl:w-[33.021vw] max-[1024px]:w-[70%]"
        />

        <div className="filters" ref={filterRef}>
          <div className="filter-item flex gap-x-[5.208vw] mt-[5.208vw] justify-center max-[1024px]:flex-wrap max-[1024px]:gap-[20px] items-start">
            {/* Categories dropdown */}
            <div className="relative">
              <button
                type="button"
                className={filterTriggerClass}
                onClick={() => setOpenFilter(openFilter === 'category' ? null : 'category')}
              >
                <strong>Categories</strong> {categoryLabel} <Arrow isOpen={openFilter === 'category'} />
              </button>
              {openFilter === 'category' && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setCategoryFilter('all'); setOpenFilter(null); }}>All</button>
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setCategoryFilter('gifts'); setOpenFilter(null); }}>Gifts</button>
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setCategoryFilter('cashfunds'); setOpenFilter(null); }}>Cash Funds</button>
                </div>
              )}
            </div>
            {/* Price dropdown */}
            <div className="relative">
              <button
                type="button"
                className={filterTriggerClass}
                onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
              >
                <strong>price</strong> {priceSort === 'low-to-high' ? 'low to high' : 'high to low'} <Arrow isOpen={openFilter === 'price'} />
              </button>
              {openFilter === 'price' && (
                <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setPriceSort('low-to-high'); setOpenFilter(null); }}>low to high</button>
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setPriceSort('high-to-low'); setOpenFilter(null); }}>high to low</button>
                </div>
              )}
            </div>
            {/* Status dropdown */}
            <div className="relative">
              <button
                type="button"
                className={filterTriggerClass}
                onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
              >
                <strong>status</strong> {statusFilter === 'gifted' ? 'Gifted' : statusFilter === 'ungifted' ? 'Ungifted' : 'All'} <Arrow isOpen={openFilter === 'status'} />
              </button>
              {openFilter === 'status' && (
                <div className="absolute top-full left-0 mt-1 min-w-[140px] bg-[#FAF9F6] border border-[#1F1D1B] rounded shadow-lg z-50 py-1">
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setStatusFilter('all'); setOpenFilter(null); }}>All</button>
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setStatusFilter('gifted'); setOpenFilter(null); }}>Gifted</button>
                  <button type="button" className="block w-full text-left px-4 py-2 uppercase text-[18px] lg:text-[0.938vw] hover:bg-[#eee] border-0 bg-transparent" onClick={() => { setStatusFilter('ungifted'); setOpenFilter(null); }}>Ungifted</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {(categoryFilter === 'all' || categoryFilter === 'gifts') && (
          <div className="gap-6 mt-[5.938vw]">
            <h2 className="text-[20px] leading-[36px] lg:text-[1.563vw] xl:text-[1.563vw] 2xl:text-[1.563vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-bold text-center mb-[3.385vw]">GIFTS</h2>
            <ProductPage data={data} priceSort={priceSort} statusFilter={statusFilter} />
          </div>
        )}

        {(categoryFilter === 'all' || categoryFilter === 'cashfunds') && (
          <div className="gap-6 mt-[6vw]">
            <h2 className="text-[20px] leading-[36px] lg:text-[1.563vw] xl:text-[1.563vw] 2xl:text-[1.563vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-bold text-center mb-[3.385vw]">CASH FUNDS</h2>
            <FundPage data={cashfundData} priceSort={priceSort} statusFilter={statusFilter} />
          </div>
        )}
      </div>
      <div className="py-[8.177vw] w-full flex justify-center items-center max-[1024px]:py-[50px]">
        <div className="py-10 lg:py-[3.438vw] xl:py-[3.438vw] 2xl:py-[3.438vw] bg-[#446184] flex items-center justify-between flex-row lg:w-[81.354vw] xl:w-[81.354vw] 2xl:w-[81.354vw] lg:min-h-[28.698vw] xl:min-h-[28.698vw] 2xl:min-h-[28.698vw] w-full max-[768px]:p-10 mt-0 gap-x-16 max-[1024px]:p-[20px] max-[1024px]:flex-wrap max-[1024px]:items-center">
          <div className='pl-[25px] max-[1024px]:pl-[0px]'>
            <img
              src="/assets/Images/giftCard.png"
              alt="gift"
              className="w-full h-full object-cover lg:w-[31.547vw] xl:w-[31.547vw] 2xl:w-[31.547vw] max-[1024px]:w-[70%] max-[1024px]:mb-[20px] max-[1024px]:mx-auto"
            />
          </div>
          <div className='flex flex-col items-center justify-center pr-[7.656vw] max-[1024px]:pr-[0px] max-[1024px]:w-[100%]'>
            <h3 className="text-2xl text-white lg:text-[2.292vw] xl:text-[2.292vw] 2xl:text-[2.292vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full prata max-w-[410px] text-center lg:mb-[0.677vw] xl:mb-[0.677vw] 2xl:mb-[0.677vw]">
              add a gift card
            </h3>
            <img
              src="/assets/Images/white-bdr.png"
              alt="couple"
              className="max-w-[325.9px] mb-[35px] lg:mb-[1.792vw] xl:mb-[1.792vw] 2xl:mb-[1.792vw] mx-auto max-[1024px]:mb-[20px] max-[1024px]:w-[70%] max-[1024px]:mx-auto"
            />
            <h5 className="text-white text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[2.292vw] xl:leading-[2.292vw] 2xl:leading-[2.292vw] leading-[44px] text-center font-[500] mt-0 mb-[2.083vw] max-[1024px]:text-[16px] max-[1024px]:leading-[20px] max-[1024px]:mb-[20px]">
              CONTRIBUTE TO OUR JOURNEY!
            </h5>
            <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] leading-[30px] text-white max-w-[30.99vw] mt-0 mb-[2.708vw] font-normal text-center max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:mb-[20px] max-[1024px]:w-[100%] max-[1024px]:max-w-full">
              Help us create our dream wedding, honeymoon or life experience.
              We're so grateful.
            </p>
            <Link to="/dashboard/giftcards">
              <button
                type="button"
                className="text-black font-bold py-4 px-8 bg-[#F5F2ED] lg:w-[15.417vw] xl:w-[15.417vw] 2xl:w-[15.417vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] text-[18px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] rounded-none cursor-pointer mx-auto block max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:mb-[20px] max-[1024px]:w-[100%] max-[1024px]:max-w-full"
              >
                ADD GIFT CARDS
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      
    </>
  );
};

export default index;
const ProductPage = ({data, priceSort, statusFilter}) => {
  if (!Array.isArray(data)) return null;

  // Helper: determine if a product is gifted
  const isProductGifted = (product) => {
    // Prefer explicit backend flag when available
    if (typeof product.isPurchased === 'boolean') {
      return product.isPurchased;
    }
    const quantity = Number(product.quantity) || 1;
    const purchasedQuantity = Number(product.purchasedQuantity) || 0;
    const stillNeeds = Math.max(0, quantity - purchasedQuantity);
    return stillNeeds === 0;
  };

  // Helper: get numeric amount for sorting
  const getProductAmount = (product) => {
    const priceObj = product.variants?.edges?.[0]?.node?.priceV2;
    if (priceObj && priceObj.amount) {
      return Number(priceObj.amount) || 0;
    }
    return Number(product.amount) || 0;
  };

  let filteredData = [...data];

  // Apply status filter
  if (statusFilter === 'gifted') {
    filteredData = filteredData.filter((product) => isProductGifted(product));
  } else if (statusFilter === 'ungifted') {
    filteredData = filteredData.filter((product) => !isProductGifted(product));
  }

  // Apply price sort
  if (priceSort === 'low-to-high') {
    filteredData.sort((a, b) => getProductAmount(a) - getProductAmount(b));
  } else if (priceSort === 'high-to-low') {
    filteredData.sort((a, b) => getProductAmount(b) - getProductAmount(a));
  }

  // Calculate how many placeholder images to show
  const actualGiftsCount = filteredData.length;
  const placeholderCount = Math.max(0, 4 - actualGiftsCount);

  // Create array of placeholder elements
  const placeholderElements = Array.from(
    {length: placeholderCount},
    (_, index) => (
      <div
        key={`placeholder-${index}`}
        className={`mb-4 flex items-center justify-center ${
          data.length > 4 ? 'snap-start min-w-[360px] max-w-[360px]' : 'w-full'
        }`}
      >
        <Link to="/dashboard/addgifts">
          <img
            src="/assets/Images/add-gift-placeholder.png"
            alt="Add gift placeholder"
            className="w-full h-full object-contain"
          />
        </Link>
      </div>
    ),
  );

  return (
    <div className="">
      <div
        className={`${
          filteredData.length > 4
            ? 'flex gap-[2.917vw] mt-0 overflow-x-auto snap-x snap-mandatory'
            : 'grid gap-[2.917vw] mt-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-hidden'
        }`}
        style={{
          scrollSnapType: data.length > 4 ? 'x mandatory' : undefined,
        }}
      >
        {filteredData.length > 0
          ? filteredData.map((product) => {
            console.log('Product:', product);
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

              return (
                <div
                  key={product.id || product.productId || Math.random()}
                  className={`${
                    isFullyGifted ? 'overlay-gifted' : ''
                  } flex flex-col justify-between ${
                    data.length > 4
                      ? 'snap-start min-w-[360px] max-w-[360px]'
                      : 'w-full'
                  }`}
                >
                  <div className="flex flex-col justify-between">
                    <div className="h-[380px] w-full mb-4 flex items-center justify-center relative">
                      <Link to={`/dashboard/addgifts/${product.handle}`} key={product.handle}>
                      <img
                        src={
                          product.images?.edges?.[0]?.node?.url ||
                          '/assets/Images/placeholder.png'
                        }
                        alt={product.title || 'Product'}
                        className="w-full h-full aspect-square object-cover mb-4"
                      />
                      </Link>

                      {product.isGroupGift && (
                        <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                          <h2 className="prata text-black text-sm text-center font-bold mt-1">
                            group <br /> gift
                          </h2>
                        </div>
                      )}
                    </div>
                    <Link to={`/dashboard/addgifts/${product.handle}`} key={product.handle}>
                    <h2
                      className={`text-[22px] uppercase m-0 font-semibold ${
                        isFullyGifted
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      {product.title || 'No Name'}
                    </h2>
                    </Link>
                    <div className="flex justify-between items-center mb-8">
                      <p className="text-2xl font-normal ">
                        {formatPrice(price?.amount || product.amount || 0)}
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

                  {/* <div className="mt-4 flex flex-col justify-end">
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
                  </div> */}
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
const FundPage = ({data, priceSort, statusFilter}) => {
  // Defensive: handle missing or malformed data
  if (!Array.isArray(data)) return <div>No funds available.</div>;

  // Helper: determine if a fund is gifted
  const isFundGifted = (fund) => {
    const totalAmount = Number(fund.amount) || 0;
    const collectedAmount = Number(fund.collectedAmount) || 0;
    const remainingAmount = Math.max(0, totalAmount - collectedAmount);
    const isAnyAmount = fund.cashFund?.isAnyAmount || false;

    // Prefer explicit backend flag when available
    if (typeof fund.isPurchased === 'boolean') {
      return fund.isPurchased;
    }

    // Fallback: fully funded non "any amount" funds are treated as gifted
    return !isAnyAmount && remainingAmount === 0;
  };

  // Helper: numeric amount for sorting
  const getFundAmount = (fund) => Number(fund.amount) || 0;

  // Apply status filter
  let filteredData = [...data];
  if (statusFilter === 'gifted') {
    filteredData = filteredData.filter((fund) => isFundGifted(fund));
  } else if (statusFilter === 'ungifted') {
    filteredData = filteredData.filter((fund) => !isFundGifted(fund));
  }

  // Apply price sort
  if (priceSort === 'low-to-high') {
    filteredData.sort((a, b) => getFundAmount(a) - getFundAmount(b));
  } else if (priceSort === 'high-to-low') {
    filteredData.sort((a, b) => getFundAmount(b) - getFundAmount(a));
  }

  // Calculate how many placeholder images to show
  const actualFundsCount = filteredData.length;
  const placeholderCount = Math.max(0, 4 - actualFundsCount);

  // Create array of placeholder elements
  const placeholderElements = Array.from(
    {length: placeholderCount},
    (_, index) => (
      <div
        key={`placeholder-${index}`}
        className={`mb-4 flex items-center justify-center ${
          filteredData.length > 4 ? 'snap-start min-w-[360px] max-w-[360px]' : 'w-full'
        }`}
      >
        <Link to="/cash-funds">
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
    <div className="min-[1025px]:px-[5vw]">
      <div
        className={`${
          filteredData.length > 4
            ? 'flex gap-[3.281vw] pb-4 overflow-x-auto snap-x snap-mandatory'
            : 'grid gap-[3.281vw] pb-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-x-hidden'
        }`}
        style={{
          scrollSnapType: data.length > 4 ? 'x mandatory' : undefined,
        }}
      >
        {filteredData.length > 0
          ? filteredData.map((fund) => {
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
                  } flex flex-col justify-between ${
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
                        className="w-full h-full aspect-square object-cover mb-4"
                      />
                      <div className="absolute top-0 z-0 right-2 rounded-full w-20 h-20 bg-gray-100 flex items-center justify-center">
                        <h2 className="prata text-black text-sm text-center font-bold mt-1">
                          cash <br /> fund
                        </h2>
                      </div>
                    </div>

                    <h2
                      className={`text-[22px] uppercase m-0 font-semibold ${
                        isFullyGifted && !isAnyAmount
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      {fund.cashFund?.name || 'No Fund Name'}
                    </h2>

                    <div className="flex justify-between items-center">
                      {!isAnyAmount && (
                        <p className="text-2xl font-normal ">${totalAmount.toFixed(2)}</p>
                      )}
                    </div>

                    {!isAnyAmount && (
                      <p className="text-sm italic my-2 text-right w-full mb-2 text-gray-600">
                        Remaining: ${remainingAmount.toFixed(2)}
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

                  {/* <div className="mt-4 flex flex-col justify-end">
                    <div className="text-center">
                      <Link to="/dashboard/shipgifts">
                        <button className="bg-white w-full border px-4 py-4 uppercase text-sm font-semibold hover:bg-black hover:text-white">
                          View Contributors
                        </button>
                      </Link>
                    </div>
                  </div> */}
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
