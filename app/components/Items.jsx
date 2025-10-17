import { Link, useNavigate } from '@remix-run/react';
import kyleanderik from '/assets/Images/KYLE-ERIK-EDITS-20 1.png';
import kyleanderikmobile from '/assets/Images/kyleerikmobile.png';
import img1 from '/assets/Images/Mask group.png';

const Items = ({ featuredRegistryData = null }) => {
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🔍 DEBUG: Items component received:', featuredRegistryData);
  
  if (!featuredRegistryData) {
    console.log('🔍 DEBUG: No featuredRegistryData in Items component');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No registry data available</p>
      </div>
    );
  }

  const handleProductClick = (productHandle) => {
    // Navigate to product detail page (accessible to everyone)
    navigate(`/dashboard/addgifts/${productHandle}`);
  };

  const { parentCollection, subCollection } = featuredRegistryData;
  
  console.log('🔍 DEBUG: Parent collection in Items:', parentCollection);
  console.log('🔍 DEBUG: Sub collection in Items:', subCollection);
  
  // Get products from the sub-collection
  const products = subCollection?.products?.edges || [];
  
  console.log('🔍 DEBUG: Products count in Items:', products.length);
  console.log('🔍 DEBUG: Products in Items:', products);

  return (
    <div>
      <div className="grid h-[740px] max-[1024px]:h-[212vw] lg:justify-center grid-cols-2 lg:grid-cols-[27.083vw_18.49vw_18.49vw_18.49vw] lg:grid-rows-2 lg:gap-[1.146vw] max-[1024px]:gap-y-[20px] max-[1024px]:gap-x-[7px]">
        {/* First item spans full width */}
        <div className="lg:row-span-2 max-[1025px]:col-span-2 w-full max-[1024px]:h-[51vw]">
          <div className="featureImage relative insetshadow registrytag h-full max-[1024px]:h-[51vw]">
            <img 
              src={subCollection?.image?.url || parentCollection?.image?.url || img1} 
              alt={subCollection?.title || parentCollection?.title || "Registry Collection"} 
              className="max-[1024px]:hidden h-full w-full object-cover rounded-none" 
            />
            <img
              src={subCollection?.image?.url || parentCollection?.image?.url || img1}
              alt={subCollection?.title || parentCollection?.title || "Registry Collection"}
              className="hidden max-[1024px]:block w-full h-full object-top object-cover rounded-none"
            />
            
            {/* Mobile title */}
            <h4 className="max-[1024px]:hidden hidden absolute top-4 left-4 text-lg text-white uppercase tracking-widest font-semibold z-10 px-2">
              {subCollection?.title || parentCollection?.title || "Registry Collection"}
            </h4>
          </div>
        </div>

        {/* Dynamic products from the first 6 products */}
        {products.slice(0, 6).map((product, index) => (
          <div 
            key={product.node.id || index} 
            className="item flex-1 cursor-pointer"
            onClick={() => handleProductClick(product.node.handle)}
          >
            <img 
              src={product.node.images?.edges?.[0]?.node?.url || img1} 
              alt={product.node.title || `Product ${index + 1}`} 
              className="rounded-none w-[350px] h-[280px] max-[1024px]:w-full max-[1024px]:h-[30vw] object-cover" 
            />
            <h3 className="mt-2 lg:mt-[21px] bastardogrotesk lg:leading-[1.146vw] lg:mb-[4px] font-[500] text-[11px] lg:text-[1.146vw] uppercase">
              {product.node.title || `Product ${index + 1}`}
            </h3>
            <p className="text-[11px] mt-[9px] max-[1024px]:mt-[5px] lg:text-[1.146vw] lg:leading-[1.146vw] bastardogrotesk">
              {product.node.description ? 
                product.node.description.slice(0, 20) + (product.node.description.length > 20 ? '...' : '') : 
                'Product Description'
              }
            </p>
          </div>
        ))}

        {/* Fallback items if no dynamic products */}
        {products.length === 0 && (
          <>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                No Products Available
              </h3>
              <p className="text-sm lg:text-[22px]">This collection is empty</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Items;