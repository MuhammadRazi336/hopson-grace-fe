import React from 'react'
import brand1 from '/assets/Images/brands/image_9.png';
import brand2 from '/assets/Images/brands/1456ead1987f9ff92eaa25a31ac01721cc0ba3d7.png';
import brand3 from '/assets/Images/brands/image_8.png';
import brand4 from '/assets/Images/brands/image_11.png';

const BrandImages = () => {
  // Create an array of brand images
  const brands = [brand1, brand2, brand3, brand4];
  
  // Generate the repeated images using map
  const generateBrandImages = () => {
    const images = [];
    for (let i = 0; i < 13; i++) {
      brands.forEach((brand, index) => {
        images.push(
          <img 
            key={`${i}-${index}`} 
            src={brand} 
            alt={`brand${index + 1}`} 
            className='w-52'
          />
        );
      });
    }
    return images;
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