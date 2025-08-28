import kyleanderik from '/assets/Images/KYLE-ERIK-EDITS-20 1.png';
import kyleanderikmobile from '/assets/Images/kyleerikmobile.png';
import img1 from '/assets/Images/Mask group.png';

const Items = ({ featuredRegistryData = null }) => {
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

  const { parentCollection, subCollection } = featuredRegistryData;
  
  console.log('🔍 DEBUG: Parent collection in Items:', parentCollection);
  console.log('🔍 DEBUG: Sub collection in Items:', subCollection);
  
  // Get products from the sub-collection
  const products = subCollection?.products?.edges || [];
  
  console.log('🔍 DEBUG: Products count in Items:', products.length);
  console.log('🔍 DEBUG: Products in Items:', products);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-[30%_23%_23%_23%] lg:grid-rows-2 gap-6 max-[1024px]:gap-y-5 max-[1024px]:gap-x-2">
        {/* First item spans full width */}
        <div className="lg:row-span-2 max-[768px]:col-span-2">
          <div className="featureImage relative insetshadow registrytag h-full">
            <img 
              src={subCollection?.image?.url || parentCollection?.image?.url || img1} 
              alt={subCollection?.title || parentCollection?.title || "Registry Collection"} 
              className="max-[1024px]:hidden h-full w-full object-cover" 
            />
            <img
              src={subCollection?.image?.url || parentCollection?.image?.url || img1}
              alt={subCollection?.title || parentCollection?.title || "Registry Collection"}
              className="hidden max-[1024px]:block w-full h-full object-cover"
            />
            <h4 className="max-[1024px]:hidden absolute top-9 left-9 text-[28px] text-white uppercase tracking-widest font-semibold z-10">
              {subCollection?.title || parentCollection?.title || "Registry Collection"}
            </h4>
            
            {/* Mobile title */}
            <h4 className="max-[1024px]:block hidden absolute top-4 left-4 text-lg text-white uppercase tracking-widest font-semibold z-10 px-2">
              {subCollection?.title || parentCollection?.title || "Registry Collection"}
            </h4>
          </div>
        </div>

        {/* Dynamic products from the first 6 products */}
        {products.slice(0, 6).map((product, index) => (
          <div key={product.node.id || index} className="item flex-1">
            <img 
              src={product.node.images?.edges?.[0]?.node?.url || img1} 
              alt={product.node.title || `Product ${index + 1}`} 
              className="w-full rounded-none" 
            />
            <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
              {product.node.title || `Product ${index + 1}`}
            </h3>
            <p className="text-sm lg:text-[22px]">
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