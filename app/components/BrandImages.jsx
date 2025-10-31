import React from 'react'
import { Link } from '@remix-run/react'

const BrandImages = ({ brandCollections = [] }) => {
  // If no brand collections, return empty div
  if (!brandCollections || brandCollections.length === 0) {
    return <div></div>;
  }
  
  // Generate images for each brand (brands are already sorted alphabetically from the loader)
  const generateBrandImages = () => {
    return brandCollections.map((brand, index) => (
      <Link 
        key={brand.id || index} 
        to={`/brand/${brand.handle}`}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <img 
          src={brand.image?.url || '/assets/Images/placeholder.png'} 
          alt={brand.image?.altText || brand.title || `brand${index + 1}`} 
          className='w-52 cursor-pointer'
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = '/assets/Images/placeholder.png';
          }}
        />
      </Link>
    ));
  };

  return (
    <div>
        <div className='w-full h-fit flex flex-wrap justify-center items-center gap-16'>
        {generateBrandImages()}
        </div>
    </div>
  )
}

export default BrandImages