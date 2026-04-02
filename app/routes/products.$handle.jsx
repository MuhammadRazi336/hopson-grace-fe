import React, {useState, useEffect, useRef} from 'react';
import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {Link, useFetcher, useLoaderData, useNavigate, useParams} from '@remix-run/react';
import {defer, json} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {extractShopifyId} from '~/utils/helpers.js';
import PreviewRegistry from '~/components/PreviewRegistry';
import {Swiper, SwiperSlide} from 'swiper/react';
import nextitem from '/assets/Images/next.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import youll1 from '/assets/Images/youll-1.png';
import youll2 from '/assets/Images/youll-2.png';
import youll3 from '/assets/Images/youll-3.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/heading-bottom-curve.png';
import giftBottomCurve from '/assets/Images/gifts-bottom-line.png';
import CustomTab from '~/components/CustomTab';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import {Footer} from '~/components/Footer';
import {Navigation} from 'swiper/modules';
import {Header} from '~/components/Header';
import ExploreCategories from '~/components/ExploreCategories';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import WeThinkYouLove from '~/components/WeThinkYouLove';
import BackToTop from '~/components/BackToTop';

const tabsData = [
  {
    label: 'REAL REGISTRIES',
    value: 1,
    route: 'realregistries',
  },
  {
    label: 'THEMED REGISTRIES',
    value: 2,
    route: 'themedregistries',
  },
  {
    label: 'LOREM IPSUM',
    value: 3,
    route: 'lorem',
  },
];

export async function loader({request, context, params}) {
  const {handle} = params;
  const {products} = await loadCriticalData({context});
  const {collections} = await loadCollectionData({context});
  const user = context?.session?.get('@User');

  let registry = null;
  let userData = null;
  let selectedCollection = null;

  // Find the selected collection based on the handle from URL
  if (handle) {
    selectedCollection = collections.find(col => col.handle === handle);
  }

  const getParentCollectionForSelected = (collection, allCollections) => {
    if (!collection) return null;
    if (collection.parentMetafield?.value === 'true') return collection;

    return (
      allCollections.find((candidate) => {
        if (candidate.parentMetafield?.value !== 'true') return false;

        const refs =
          candidate.subCollectionMetafield?.references?.edges?.map(
            (edge) => edge?.node?.id,
          ) || [];
        if (refs.includes(collection.id)) return true;

        if (!candidate.subMetafield?.value) return false;
        try {
          const gids = JSON.parse(candidate.subMetafield.value);
          return Array.isArray(gids) && gids.includes(collection.id);
        } catch {
          return false;
        }
      }) || null
    );
  };

  const parentCollection = getParentCollectionForSelected(
    selectedCollection,
    collections,
  );

  // "We think you'll love":
  // - `/products/subcollection/:handle`: recommended + current sub-collection only
  // - otherwise: recommended + any sub-collection linked to the active parent
  let recommendedProducts = [];
  try {
    const isSubCollectionRoute = request.url.includes('/products/subcollection/');
    const isSelectedSubCollection =
      selectedCollection?.parentMetafield?.value === 'false';

    const subCollectionIds = isSubCollectionRoute && isSelectedSubCollection
      ? new Set([selectedCollection.id])
      : new Set(
          getSubCollectionsForParentLoader(parentCollection, collections).map(
            (sub) => sub.id,
          ),
        );

    if (subCollectionIds.size > 0) {
      const {products: recommendedProductsData} = await context.storefront.query(
        RECOMMENDED_PRODUCTS_BY_PARENT_QUERY,
        {
          variables: {first: 80},
        },
      );

      recommendedProducts = (recommendedProductsData?.edges || [])
        .filter((edge) => {
          const node = edge?.node;
          if (!node) return false;
          const productCollectionIds = (node.collections?.nodes || []).map(
            (c) => c.id,
          );
          return productCollectionIds.some((id) => subCollectionIds.has(id));
        })
        .slice(0, 8);
    }
  } catch (error) {
    console.error('Error loading recommended products:', error);
  }

  // Only fetch registry if user is logged in
  if (user && user.user && user.user.id) {
    try {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
      userData = user;
    } catch (error) {
      console.error('Error fetching registry:', error);
      // Continue without registry data
    }
  }

  return defer({products, collections, registry, userData, selectedCollection, handle, recommendedProducts});
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

async function loadCriticalData({context}) {
  const token =
    process.env.PUBLIC_STOREFRONT_API_TOKEN ||
    context.env?.PUBLIC_STOREFRONT_API_TOKEN;
  try {
    const [{products}] = await Promise.all([
      context.storefront.query(PRODUCT_QUERY),
    ]);
    return {
      products: products?.edges || [],
    };
  } catch (error) {
    throw error;
  }
}

/** Sub-collections linked on the parent (same rules as client `getSubCollectionsForParent`). */
function getSubCollectionsForParentLoader(parentCol, allCollections) {
  if (!parentCol) return [];
  if (parentCol.subCollectionMetafield?.references?.edges?.length) {
    return parentCol.subCollectionMetafield.references.edges
      .map((edge) => edge?.node)
      .filter(Boolean);
  }
  if (parentCol.subMetafield?.value) {
    try {
      const gids = JSON.parse(parentCol.subMetafield.value);
      return allCollections.filter((c) => gids.includes(c.id));
    } catch {
      return [];
    }
  }
  return [];
}

async function loadCollectionData({context}) {
  try {
    const [{collections}] = await Promise.all([
      context.storefront.query(COLLECTION_QUERY),
    ]);

    const collectionNodes = collections?.nodes || [];
    const hydratedCollections = [];

    for (const col of collectionNodes) {
      if (col.readyMadeMetafield?.value === 'true') {
        hydratedCollections.push(col);
        continue;
      }

      const allProductEdges = await fetchAllCollectionProducts(
        context.storefront,
        col.id,
      );

      hydratedCollections.push({
        ...col,
        products: {
          edges: allProductEdges,
        },
      });
    }

    return {
      collections: hydratedCollections,
    };
  } catch (error) {
    throw error;
  }
}

async function fetchAllCollectionProducts(storefront, collectionId) {
  const pageSize = 100;
  const maxPages = 20;
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;
  const allEdges = [];

  while (hasNextPage && pageCount < maxPages) {
    const result = await storefront.query(COLLECTION_PRODUCTS_PAGE_QUERY, {
      variables: {
        id: collectionId,
        first: pageSize,
        after: cursor,
      },
    });

    const connection = result?.collection?.products;
    const edges = connection?.edges || [];
    allEdges.push(...edges);

    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    cursor = connection?.pageInfo?.endCursor || null;
    pageCount += 1;
  }

  return allEdges;
}

const isExcludedFundsCollection = (col) => {
  const t = (col.title && String(col.title).toUpperCase().trim()) || '';
  return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
};

const isParentForSlides = (col) =>
  col.parentMetafield?.value === 'true' &&
  col.readyMadeMetafield?.value !== 'true' &&
  !isExcludedFundsCollection(col);

const STYLE_OPTIONS = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'eclectic', label: 'Eclectic' },
  { id: 'shopAll', label: 'Shop All' },
];

function SidebarFilter({
  collections,
  checkedCollectionIds,
  setCheckedCollectionIds,
  selectedCollectionId,
  selectedSwiperCollectionId,
  selectedSubCollections,
  selectedHeroCollection,
  shopAllChecked,
  setShopAllChecked,
  availableBrands,
  checkedBrandIds,
  onBrandCheckbox,
  checkedStyles,
  onStyleCheckbox,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    styles: true,
    productType: true,
    brands: true,
  });

  const parentCollection = collections.filter(isParentForSlides);

  const baseSubCollection = collections.filter(
    (col) =>
      col.parentMetafield?.value === 'false' &&
      col.readyMadeMetafield?.value !== 'true',
  );

  const subCollection =
    selectedSwiperCollectionId && selectedSubCollections?.length > 0
      ? selectedSubCollections
      : baseSubCollection;

  useEffect(() => {
    if (
      !selectedSwiperCollectionId &&
      selectedCollectionId &&
      !checkedCollectionIds.includes(selectedCollectionId)
    ) {
      setCheckedCollectionIds([selectedCollectionId]);
    }
  }, [selectedSwiperCollectionId, selectedCollectionId, checkedCollectionIds, setCheckedCollectionIds]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSidebarCheckbox = (colId) => {
    let newChecked;
    if (checkedCollectionIds.includes(colId)) {
      newChecked = checkedCollectionIds.filter((id) => id !== colId);
  } else {
      newChecked = [...checkedCollectionIds, colId];
    }
    setCheckedCollectionIds(newChecked);
  };

  return (
    <div className="w-full lg:w-[19.031vw] xl:w-[19.031vw] 2xl:w-[19.031vw] py-[2.865vw] px-[1.979vw] h-fit bg-[#FAF9F6]">
      {/* When no collection selected: Product Categories + Shop by Style (Shop All + sub-collections) */}
      {!selectedSwiperCollectionId && (
        <div className="mb-6">
          <h2
            className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
            onClick={() => toggleSection('categories')}
          >
            Product Categories
            <span className="text-lg relative -top-[3px]">
              {openSections.categories ? (
                <img
                  src="/assets/Images/next.png"
                  alt="minus"
                  className="w-[0.833vw] h-[0.833vw] rotate-180"
                />
              ) : (
                <img
                  src="/assets/Images/next.png"
                  alt="plus"
                  className="w-[0.833vw] h-[0.833vw]"
                />
              )}
            </span>
          </h2>
          {openSections.categories && (
            <ul className="space-y-2 text-sm">
              {parentCollection.map((col) => (
                <li key={col.id} className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedCollectionIds.includes(col.id)}
                      onChange={() => handleSidebarCheckbox(col.id)}
                    />
                    {col.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* When a parent collection is selected: Product Type (sub-collections) + Style (hardcoded) */}
      {selectedSwiperCollectionId && (
        <>
          {/* Hide Product Type when a specific sub-collection is selected in the hero */}
          {!selectedHeroCollection && (
            <div className="mb-6">
              <h2
                className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
                onClick={() => toggleSection('productType')}
              >
                Product Type
                <span className="text-lg relative -top-[3px]">
                  {openSections.productType ? (
                    <img
                      src="/assets/Images/next.png"
                      alt="minus"
                      className="w-[0.833vw] h-[0.833vw] rotate-180"
                    />
                  ) : (
                    <img
                      src="/assets/Images/next.png"
                      alt="plus"
                      className="w-[0.833vw] h-[0.833vw]"
                    />
                  )}
                </span>
              </h2>
              {openSections.productType &&
                (selectedSubCollections || []).length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {(selectedSubCollections || []).map((col) => (
                      <li key={col.id} className="mb-[1.69vw]">
                        <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                          <input
                            type="checkbox"
                            className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                            checked={checkedCollectionIds.includes(col.id)}
                            onChange={() => handleSidebarCheckbox(col.id)}
                          />
                          {col.title}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          )}
          <div className="mb-6">
            <h2
              className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
              onClick={() => toggleSection('brands')}
            >
              Brands
              <span className="text-lg relative -top-[3px]">
                {openSections.brands ? (
                  <img
                    src="/assets/Images/next.png"
                    alt="minus"
                    className="w-[0.833vw] h-[0.833vw] rotate-180"
                  />
                ) : (
                  <img
                    src="/assets/Images/next.png"
                    alt="plus"
                    className="w-[0.833vw] h-[0.833vw]"
                  />
                )}
              </span>
            </h2>
            {openSections.brands && (
              <ul className="space-y-2 text-sm">
                {(availableBrands || []).map((brand) => (
                  <li key={brand.id} className="mb-[1.69vw]">
                    <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                      <input
                        type="checkbox"
                        className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                        checked={checkedBrandIds?.includes(brand.id)}
                        onChange={() => onBrandCheckbox?.(brand.id)}
                      />
                      {brand.title}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2
              className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
              onClick={() => toggleSection('styles')}
            >
              Style
              <span className="text-lg relative -top-[3px]">
                {openSections.styles ? (
                  <img
                    src="/assets/Images/next.png"
                    alt="minus"
                    className="w-[0.833vw] h-[0.833vw] rotate-180"
                  />
                ) : (
                  <img
                    src="/assets/Images/next.png"
                    alt="plus"
                    className="w-[0.833vw] h-[0.833vw]"
                  />
                )}
              </span>
            </h2>
            {openSections.styles && (
              <ul className="space-y-2 text-sm">
                {STYLE_OPTIONS.map((opt) => (
                  <li key={opt.id} className="mb-[1.69vw]">
                    <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                      <input
                        type="checkbox"
                        className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                        checked={checkedStyles?.[opt.id]}
                        onChange={() => onStyleCheckbox?.(opt.id)}
                      />
                      {opt.label}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* When no collection selected: Shop by Style (Shop All + sub-collections) */}
      {!selectedSwiperCollectionId && (
        <div>
          <h2
            className="text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] gap-[0.833vw] lg:leading-[0.938vw] font-bold uppercase mb-[2.292vw] cursor-pointer flex items-center"
            onClick={() => toggleSection('styles')}
          >
            Shop by Style
            <span className="text-lg relative -top-[3px]">
              {openSections.styles ? (
                <img
                  src="/assets/Images/next.png"
                  alt="minus"
                  className="w-[0.833vw] h-[0.833vw] rotate-180"
                />
              ) : (
                <img
                  src="/assets/Images/next.png"
                  alt="plus"
                  className="w-[0.833vw] h-[0.833vw]"
                />
              )}
            </span>
          </h2>
          {openSections.styles && (
            <ul className="space-y-2 text-sm">
              <li className="mb-[1.69vw]">
                <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                  <input
                    type="checkbox"
                    className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                    checked={shopAllChecked}
                    onChange={() => setShopAllChecked((prev) => !prev)}
                  />
                  Shop All
                </label>
              </li>
              {subCollection.map((col) => (
                <li key={col.id} className="mb-[1.69vw]">
                  <label className="uppercase flex items-center gap-[1.10vw] lg:text-[1.04vw] xl:text-[1.04vw] 2xl:text-[1.04vw]">
                    <input
                      type="checkbox"
                      className="m-0 w-[1.56vw] h-[1.56vw] rounded-none appearance-none border-[#1F1D1B] checked:bg-[#1F1D1B]"
                      checked={checkedCollectionIds.includes(col.id)}
                      onChange={() => handleSidebarCheckbox(col.id)}
                    />
                    {col.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductCollection() {
  const [availability, setAvailability] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [dateSort, setDateSort] = useState('');
  const [addingProductId, setAddingProductId] = useState(null);

  const {products, collections, registry, userData, selectedCollection, handle, recommendedProducts} = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const params = useParams();

  const userId = userData?.user?.id;

  const [checkedCollectionIds, setCheckedCollectionIds] = useState(selectedCollection ? [selectedCollection.id] : []);
  const initialPreferencesApplied = useRef(false);
  const [productsToShow, setProductsToShow] = useState(12);
  const productGridRef = useRef(null);
  const topRef = useRef(null);
  const [selectedSwiperCollectionId, setSelectedSwiperCollectionId] = useState(null);
  const [selectedSubCollections, setSelectedSubCollections] = useState([]);
  const [selectedHeroCollection, setSelectedHeroCollection] = useState(null);
  const [shopAllChecked, setShopAllChecked] = useState(false);
  const [checkedBrandIds, setCheckedBrandIds] = useState([]);
  const [checkedStyles, setCheckedStyles] = useState(() =>
    STYLE_OPTIONS.reduce((acc, o) => ({ ...acc, [o.id]: false }), {}),
  );
  const handleStyleCheckbox = (id) => {
    setCheckedStyles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSubCollectionsForParent = (parentCol) => {
    if (!parentCol) return [];
    if (parentCol.subCollectionMetafield?.references?.edges) {
      return parentCol.subCollectionMetafield.references.edges.map((edge) => edge.node);
    }
    if (parentCol.subMetafield?.value) {
      try {
        const gids = JSON.parse(parentCol.subMetafield.value);
        return collections.filter((c) => gids.includes(c.id));
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (!selectedCollection || !collections?.length) return;
    const isParent = selectedCollection.parentMetafield?.value === 'true';
    if (isParent) {
      const subs = getSubCollectionsForParent(selectedCollection);
      setSelectedSwiperCollectionId(selectedCollection.id);
      setSelectedSubCollections(subs);
      // Do not pre-select any Product Type checkboxes
      setCheckedCollectionIds([]);
      setShopAllChecked(true);
      setSelectedHeroCollection(null);
    } else {
      const parent = collections.find((col) => {
        if (col.parentMetafield?.value !== 'true') return false;
        const subs = getSubCollectionsForParent(col);
        return subs.some((s) => s.id === selectedCollection.id);
      });
      if (parent) {
        const subs = getSubCollectionsForParent(parent);
        setSelectedSwiperCollectionId(parent.id);
        setSelectedSubCollections(subs);
        const fullSub =
          collections.find((c) => c.id === selectedCollection.id) ||
          selectedCollection;
        setCheckedCollectionIds([selectedCollection.id]);
        setShopAllChecked(false);
        setSelectedHeroCollection(fullSub);
      }
    }
  }, [selectedCollection?.id, collections?.length]);

  // Helper to get all products for checked collections
  const getProductsForCheckedCollections = (checkedIds) => {
    const checkedParents = collections.filter(
      (col) =>
        col.parentMetafield?.value === 'true' && checkedIds.includes(col.id),
    );
    const checkedSubs = collections.filter(
      (col) =>
        col.parentMetafield?.value === 'false' && checkedIds.includes(col.id),
    );
    let parentProducts = [];
    checkedParents.forEach((parentCol) => {
      let subCols = [];
      if (parentCol.subCollectionMetafield?.references?.edges) {
        const refs = parentCol.subCollectionMetafield.references.edges.map((edge) => edge.node);
        // Resolve reference nodes to full collections (with products) from loader data
        subCols = refs
          .map((ref) => collections.find((c) => c.id === ref.id))
          .filter(Boolean);
      } else {
        let subCollectionGids = [];
        const subColMeta = parentCol.subMetafield;
        if (subColMeta?.value) {
          try {
            subCollectionGids = JSON.parse(subColMeta.value);
          } catch (error) {
            console.error('Error parsing subCollectionGids:', error);
          }
        }
        subCols = collections.filter(
          (col) =>
            col.parentMetafield?.value === 'false' &&
            subCollectionGids.includes(col.id),
        );
      }
      parentProducts = parentProducts.concat(
        subCols.length > 0
          ? subCols.flatMap((col) =>
              (col.products?.edges || []).map((edge) => edge.node),
            )
          : [],
      );
    });
    const subProducts =
      checkedSubs.length > 0
        ? checkedSubs.flatMap((col) =>
            (col.products?.edges || []).map((edge) => edge.node),
          )
        : [];
    const allProducts = [...parentProducts, ...subProducts];
    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p.id, p])).values(),
    );
    return uniqueProducts;
  };

  const handleBrandCheckbox = (brandId) => {
    setCheckedBrandIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  };

  const selectedBrandCollections = React.useMemo(
    () =>
      (collections || []).filter((col) => col.brandMetafield?.value === 'true'),
    [collections],
  );

  const productBrandIdsMap = React.useMemo(() => {
    const map = new Map();
    selectedBrandCollections.forEach((brandCol) => {
      const productIds =
        brandCol.products?.edges?.map((edge) => edge?.node?.id).filter(Boolean) ||
        [];
      productIds.forEach((productId) => {
        const current = map.get(productId) || [];
        if (!current.includes(brandCol.id)) current.push(brandCol.id);
        map.set(productId, current);
      });
    });
    return map;
  }, [selectedBrandCollections]);

  // Same as visible grid but without brand narrowing — keeps sidebar brand list stable when toggling brands
  const displayedProductsBeforeBrandFilter = React.useMemo(() => {
    let list = [];
    const fullSubCollections = (selectedSubCollections || [])
      .map((ref) => collections.find((c) => c.id === ref.id))
      .filter(Boolean);

    if (selectedSwiperCollectionId && fullSubCollections.length > 0) {
      if (shopAllChecked) {
        list = fullSubCollections.flatMap((col) =>
          (col.products?.edges || []).map((edge) => edge.node),
        );
      } else if (checkedCollectionIds.length > 0) {
        const subCols = fullSubCollections.filter((col) =>
          checkedCollectionIds.includes(col.id),
        );
        list = subCols.flatMap((col) =>
          (col.products?.edges || []).map((edge) => edge.node),
        );
      } else {
        list = fullSubCollections.flatMap((col) =>
          (col.products?.edges || []).map((edge) => edge.node),
        );
      }
      list = Array.from(new Map(list.map((p) => [p.id, p])).values());
      const selectedStyleIds = STYLE_OPTIONS.filter(
        (o) => o.id !== 'shopAll' && checkedStyles[o.id],
      ).map((o) => o.id);
      if (selectedStyleIds.length > 0) {
        list = list.filter((product) => {
          const productStyle = (product.styleMetafield?.value || '').trim().toLowerCase();
          if (!productStyle) return false;
          return selectedStyleIds.some((id) => productStyle === id);
        });
      }
      return list;
    }
    return getProductsForCheckedCollections(checkedCollectionIds);
  }, [
    shopAllChecked,
    selectedSwiperCollectionId,
    selectedSubCollections,
    checkedCollectionIds,
    checkedStyles,
    collections,
  ]);

  const displayedProducts = React.useMemo(() => {
    const fullSubCollections = (selectedSubCollections || [])
      .map((ref) => collections.find((c) => c.id === ref.id))
      .filter(Boolean);
    const inSwiperMode =
      selectedSwiperCollectionId && fullSubCollections.length > 0;

    let list = displayedProductsBeforeBrandFilter;
    if (inSwiperMode && checkedBrandIds.length > 0) {
      list = list.filter((product) => {
        const brandIds = productBrandIdsMap.get(product.id) || [];
        return checkedBrandIds.some((brandId) => brandIds.includes(brandId));
      });
    }
    return list;
  }, [
    displayedProductsBeforeBrandFilter,
    selectedSwiperCollectionId,
    selectedSubCollections,
    checkedBrandIds,
    productBrandIdsMap,
  ]);

  const availableBrands = React.useMemo(() => {
    if (!selectedSwiperCollectionId) return [];
    const productIds = new Set(
      displayedProductsBeforeBrandFilter.map((product) => product.id),
    );
    return selectedBrandCollections.filter((brandCol) =>
      (brandCol.products?.edges || []).some((edge) =>
        productIds.has(edge?.node?.id),
      ),
    );
  }, [
    selectedSwiperCollectionId,
    displayedProductsBeforeBrandFilter,
    selectedBrandCollections,
  ]);

  useEffect(() => {
    setCheckedBrandIds([]);
  }, [selectedSwiperCollectionId, selectedHeroCollection?.id]);

  const handleAddtoRegistry = (product, quantity = 1, isGroupGift = false) => {
    try {
      // Check if user is logged in by looking for token in localStorage
      const token = localStorage.getItem('@token') || localStorage.getItem('@Token');
      
      if (!token || !userData) {
        // No token or user data found, redirect to login
        navigate('/login');
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry.data || !registry.data[0] || !registry.data[0].id) {
        console.error('Registry not found. Please create a registry first.');
        return;
      }

      const firstVariant = product?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        console.error('Product variant not found.');
        return;
      }

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry.data[0].id),
        productTypeId: 1,
        quantity: quantity || 1,
        isGroupPayment: !!isGroupGift,
      };

      setAddingProductId(product.id);

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

    } catch (error) {
      console.error('Failed to add to registry. Please try again.', error);
    }
  };

  useEffect(() => {
    if (fetcher.state === 'idle') setAddingProductId(null);
  }, [fetcher.state]);

  // Filter the products based on selected filters
  const filteredProducts = products
    .filter((productWrapper) => {
      const product = productWrapper.node;
      const firstVariant = product?.variants?.edges?.[0]?.node;

      if (!firstVariant) return false;

      if (availability) {
        const isAvailable = firstVariant.availableForSale;
        if (availability === 'in-stock' && !isAvailable) return false;
        if (availability === 'out-of-stock' && isAvailable) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = Number(a.node.variants.edges[0].node.priceV2.amount);
      const priceB = Number(b.node.variants.edges[0].node.priceV2.amount);
      const createdAtA = new Date(a.node.createdAt).getTime();
      const createdAtB = new Date(b.node.createdAt).getTime();

      if (priceSort === 'low-to-high') return priceA - priceB;
      if (priceSort === 'high-to-low') return priceB - priceA;
      if (dateSort === 'newest') return createdAtB - createdAtA;
      if (dateSort === 'oldest') return createdAtA - createdAtB;

      return 0;
    });

  const parentCollectionForSwiper = collections.filter((col) => isParentForSlides(col));

  useEffect(() => {
    if (!selectedSwiperCollectionId) setShopAllChecked(false);
  }, [selectedSwiperCollectionId]);

  return (
    <>
      <Header />
      <div ref={topRef} className="lg:scroll-mt-[92px] scroll-mt-[60px]" />
      <section className="">
        <div className=" relative items-start mt-[0] mb-0 max-[1024px]:my-10">
          <div className=" ">
            {!selectedSwiperCollectionId && (
              <>
                <div className="z-10 swiper-button-prev-prod absolute left-[0.5%] lg:w-[5.781vw] xl:w-[5.781vw] lg:h-[5.781vw] xl:h-[5.781vw] 2xl:h-[5.781vw] 2xl:w-[5.781vw] cursor-pointer text-white uppercase items-center bg-white top-[45%] translate-y-[-50%] flex justify-center max-[1024px]:w-[33px]">
                  <img src={nextitem} alt="" className="rotate-90 lg:w-[1.875vw] lg:h-[1.875vw] xl:w-[1.875vw] xl:h-[1.875vw] 2xl:w-[1.875vw] 2xl:h-[1.875vw]" />
                </div>

                <Swiper
                  spaceBetween={15}
                  slidesPerView={3.25} // Shows 3 full + a portion of 4th
                  centeredSlides={true} // Enables .5 on both sides
                  loop={true}
                  modules={[Navigation]}
                  navigation={{
                    nextEl: '.swiper-button-next-prod',
                    prevEl: '.swiper-button-prev-prod',
                  }}
                  className=""
                  breakpoints={{
                    345: {
                      slidesPerView: 1.25,
                      spaceBetween: 10,
                      centeredSlides: true,
                    },
                    475: {
                      slidesPerView: 2.25,
                      spaceBetween: 15,
                      centeredSlides: true,
                    },
                    768: {
                      slidesPerView: 2.25,
                      spaceBetween: 20,
                      centeredSlides: true,
                    },
                    1024: {
                      slidesPerView: 2.75,
                      spaceBetween: 30,
                      centeredSlides: true,
                    },
                    1366: {
                      slidesPerView: 3.7,
                      spaceBetween: 36.7,
                      centeredSlides: true,
                    },
                    1600: {
                      slidesPerView: 3.7,
                      spaceBetween: 36.7,
                      centeredSlides: true,
                    },
                  }}
                >
                  {/* Dynamic slides from Shopify collections */}
                  {parentCollectionForSwiper.map((col) => (
                    <SwiperSlide
                      key={col.id}
                      onClick={() => {
                        const subCollections = getSubCollectionsForParent(col);
                        const subCollectionGids = subCollections.map((s) => s.id);
                        setCheckedCollectionIds(subCollectionGids);
                        setSelectedSubCollections(subCollections);
                        setSelectedSwiperCollectionId(col.id);
                        setShopAllChecked(true);
                        setSelectedHeroCollection(null);
                      }}
                      style={{ cursor: 'pointer' }}
                      className="lg:w-[33.33%] xl:w-[33.33%] 2xl:w-[33.33%]"
                    >
                        <img
                          src={col.image?.url || '/assets/Images/placeholder.png'}
                          alt={col.title}
                          className="w-full h-[400px] lg:h-[22.76vw] xl:h-[22.76vw] 2xl:h-[22.76vw] object-cover"
                        />
                        <h3 className="mt-2.5 text-center lg:mt-[1.927vw] xl:mt-[1.927vw] 2xl:mt-[1.927vw] uppercase lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:text-center lg:leading-[1.146vw] text-sm font-medium tracking-wider">
                          {col.title}
                        </h3>
                      </SwiperSlide>
                    ))}
                </Swiper>
                <div className="swiper-button-next-prod absolute right-[0.5%] lg:w-[5.781vw] xl:w-[5.781vw] 2xl:w-[5.781vw] lg:h-[5.781vw] xl:h-[5.781vw] 2xl:h-[5.781vw] cursor-pointer uppercase items-center bg-white z-10 top-[45%] translate-y-[-50%] flex justify-center text-white max-[1024px]:w-[33px]">
                  <img src={nextitem} className="rotate-270 lg:w-[1.875vw] lg:h-[1.875vw] xl:w-[1.875vw] xl:h-[1.875vw] 2xl:w-[1.875vw] 2xl:h-[1.875vw]" alt="" />
                </div>
              </>
            )}

            {/* Selected collection: sub-collections carousel (like add gifts) */}
            {selectedSwiperCollectionId && selectedSubCollections?.length > 0 && (
              <div className="flex items-center bottom-0 left-0 right-0 bg-[#F5F2ED] h-[27.083vw] pl-[7.396vw] relative gap-[8.698vw] w-full overflow-hidden">
                {/* If a sub-collection is selected for hero, show its name and large image (like add gifts) */}
                {selectedHeroCollection ? (
                  <>
                    <div className="relative p-4 w-[30%]">
                      <h2 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata">
                        {selectedHeroCollection.title?.toLowerCase() || 'collection'}
                      </h2>
                      <img
                        src="/assets/Images/gifts-bottom-line.png"
                        alt="collection divider"
                        className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto object-contain"
                      />
                    </div>
                    <img
                      src={
                        selectedHeroCollection.image?.url ||
                        '/assets/Images/placeholder.png'
                      }
                      alt={selectedHeroCollection.title}
                      className="w-[70%] h-full object-cover"
                    />
                  </>
                ) : (
                  // Default: parent collection title on left, sub-collections swiper on right
                  <div className="flex items-center gap-[8.698vw] w-full">
                    <h3 className="text-[2.5vw] leading-[1.875vw] text-center font-normal lowercase prata w-[276px] shrink-0">
                      {collections.find((col) => col.id === selectedSwiperCollectionId)?.title?.toLowerCase() || 'collection'}
                      <img
                        src={giftBottomCurve}
                        alt=""
                        className="w-[14.375vw] h-[6px] mt-[1.198vw] mx-auto"
                      />
                    </h3>
                    <div className="relative flex-1 min-w-0">
                      <div className="z-20 mb-8 swiper-button-prev-sub absolute left-[35px] cursor-pointer uppercase items-center bg-white top-[43%] translate-y-[-50%] px-8 py-10 justify-center max-[1024px]:w-[33px] flex">
                        <img src={nextitem} alt="" className="rotate-90 size-6" />
                      </div>
                      <Swiper
                        spaceBetween={18}
                        slidesPerView={5}
                        loop={false}
                        modules={[Navigation]}
                        navigation={{
                          nextEl: '.swiper-button-next-sub',
                          prevEl: '.swiper-button-prev-sub',
                        }}
                        className="relative w-full"
                        breakpoints={{
                          345: {slidesPerView: 1.25, spaceBetween: 10},
                          475: {slidesPerView: 2.25, spaceBetween: 15},
                          768: {slidesPerView: 2.25, spaceBetween: 18},
                          1024: {slidesPerView: 3, spaceBetween: 18},
                          1025: {slidesPerView: 4, spaceBetween: 18},
                          1365: {slidesPerView: 5, spaceBetween: 18},
                        }}
                      >
                        {selectedSubCollections.map((subCol) => (
                          <SwiperSlide
                            key={subCol.id}
                            onClick={() => {
                              const full =
                                collections.find((c) => c.id === subCol.id) ||
                                subCol;
                              if (!full.handle) return;
                              navigate(
                                `/products/subcollection/${full.handle}`,
                              );
                            }}
                            className="cursor-pointer group min-w-[14.542vw] max-w-[17.542vw]"
                          >
                            <div className="relative overflow-hidden bg-white rounded-sm shadow-sm">
                              <img
                                src={subCol.image?.url || '/assets/Images/placeholder.png'}
                                alt={subCol.title}
                                className="w-full h-[180px] lg:h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="mt-3 text-center uppercase text-xs lg:text-sm font-medium tracking-wider text-black">
                              {subCol.title}
                            </h4>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="swiper-button-next-sub absolute right-[35px] cursor-pointer uppercase items-center bg-white z-20 top-[43%] translate-y-[-50%] px-8 py-10 justify-center max-[1024px]:w-[33px] flex">
                        <img src={nextitem} className="size-6 rotate-270" alt="" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSwiperCollectionId && (!selectedSubCollections || selectedSubCollections.length === 0) && (
              <div className="relative">
                <img
                  src={collections.find((col) => col.id === selectedSwiperCollectionId)?.image?.url || '/assets/Images/placeholder.png'}
                  alt={collections.find((col) => col.id === selectedSwiperCollectionId)?.title}
                  className="w-full h-[510px] lg:h-[800px] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-[8.594vw] mx-auto">
        <div className="flex flex-row max-[1024px]:flex-col gap-[3.75vw] w-full mx-auto pt-[5vw]">
          <SidebarFilter
            collections={collections}
            checkedCollectionIds={checkedCollectionIds}
            setCheckedCollectionIds={setCheckedCollectionIds}
            selectedCollectionId={selectedCollection?.id}
            selectedSwiperCollectionId={selectedSwiperCollectionId}
            selectedSubCollections={selectedSubCollections}
            selectedHeroCollection={selectedHeroCollection}
            shopAllChecked={shopAllChecked}
            setShopAllChecked={setShopAllChecked}
            availableBrands={availableBrands}
            checkedBrandIds={checkedBrandIds}
            onBrandCheckbox={handleBrandCheckbox}
            checkedStyles={checkedStyles}
            onStyleCheckbox={handleStyleCheckbox}
          />
          <div
            className="w-full xl:w-9/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2.135vw] pt-0 p-0 relative z-0 mb-[4.844vw]"
            ref={productGridRef}
          >
            {(() => {
              if (displayedProducts.length === 0) {
                return (
                  <div className="col-span-3 text-center text-gray-400">
                    Select a collection to view products.
                  </div>
                );
              }
              let anyRendered = false;
              const productNodes = displayedProducts
                .slice(0, productsToShow)
                .map((product) => {
                  const firstVariant = product?.variants?.edges?.[0]?.node;
                  if (!firstVariant) return null;
                  anyRendered = true;
                  const firstImage =
                    product?.images?.edges?.[0]?.node?.url ||
                    'assets/Images/placeholder.jpg';

              // Derive brand name: among this product's collections, find a collection marked as a brand
              let brandName = '';
              if (Array.isArray(collections)) {
                for (const col of collections) {
                  const isBrand = col.brandMetafield?.value === 'true';
                  if (!isBrand) continue;
                  const hasProduct =
                    col.products?.edges?.some(
                      (edge) => edge?.node?.id === product.id,
                    ) || false;
                  if (hasProduct) {
                    brandName = col.title || '';
                    break;
                  }
                }
              }
                  return (
                    <RegistryProduct
                      key={product.id}
                      id={product.id}
                      image={firstImage}
                      productName={product.title}
                      price={firstVariant.priceV2.amount}
                      description={product.description}
                      productHandle={product.handle}
                      onAddToRegistry={(quantity, isGroupGift) =>
                        handleAddtoRegistry(product, quantity, isGroupGift)
                      }
                      isSubmitting={
                        addingProductId === product.id &&
                        fetcher.state !== 'idle'
                      }
                      onGroupGiftTagChange={(isGroupGift) =>
                        console.log(`Group Gift tag changed: ${isGroupGift}`)
                      }
                  brandName={brandName || 'BRAND NAME'}
                    />
                  );
                });
              if (!anyRendered) {
                return (
                  <div className="col-span-3 text-center text-gray-400">
                    Select a collection to view products.
                  </div>
                );
              }
              return productNodes;
            })()}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-[18px] leading-[18px] mt-[6vw] mb-[2.083vw] font-[500] tracking-[0.075vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[767px]:text-[14px] max-[767px]:leading-[14px] max-[767px]:mt-[40px] max-[767px]:mb-[20px]">
              LOADING {Math.min(productsToShow, displayedProducts.length)} of{' '}
              {displayedProducts.length}
            </p>

            {displayedProducts.length > 12 &&
              productsToShow < displayedProducts.length && (
                <WhiteThemeButton
                  Text="View more"
                  onClick={() =>
                    setProductsToShow((prev) =>
                      Math.min(prev + 12, displayedProducts.length),
                    )
                  }
                />
              )}

            <BackToTop topRef={topRef} />
          </div>
        </div>
      </section>

        {recommendedProducts?.length > 0 && (
          <WeThinkYouLove recommendedProducts={recommendedProducts} />
        )}

      <div className="py-[5.26vw] px-0">
          <ExploreCategories collections={collections} />
        </div>

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
      <Footer />
    </>
  );
}

const PRODUCT_QUERY = `#graphql
  query {
    products(first: 250) {
      edges {
        node {
          handle
          description
          id
          title
          createdAt
          images(first: 250) {
            edges {
              node {
                id
                src
              }
            }
          }
          variants(first: 250) {
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
`;
const COLLECTION_QUERY = `#graphql
    query {
    collections(first: 250, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        description
        title
        id
        handle
        image {
          id
          url
          altText
          width
          height
        }
        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {
          id
          value
        }
        parentMetafield: metafield(namespace: "parent", key: "collection") {
          id
          value
        }
        subMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
        }
        brandMetafield: metafield(namespace: "custom", key: "brand") {
          id
          value
        }
        subCollectionMetafield: metafield(namespace: "sub", key: "collection") {
          id
          value
          references(first: 20) {
            edges {
              node {
                ... on Collection {
                  id
                  title
                  handle
                  description
                  image {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
        products(first: 1){
          edges {
            node {
    id
    title
    handle
    description
              styleMetafield: metafield(namespace: "custom", key: "style") {
                id
                value
              }
              images(first: 1) {
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

const COLLECTION_PRODUCTS_PAGE_QUERY = `#graphql
  query getCollectionProductsPage($id: ID!, $first: Int!, $after: String) {
    collection(id: $id) {
      id
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            handle
            description
            styleMetafield: metafield(namespace: "custom", key: "style") {
              id
              value
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                }
              }
            }
            variants(first: 10) {
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_BY_PARENT_QUERY = `#graphql
  query GetRecommendedProductsByParent($first: Int!) {
    products(first: $first, query: "tag:recommended") {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          collections(first: 30) {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`;

// Export metadata for Remix
export const meta = () => {
  return [
    {title: 'Product Collection'},
    {name: 'description', content: 'Browse our product collection'},
  ];
};

// Export handle for Remix
export const handle = {
  hydrate: true,
};
