const images = [
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  '/assets/Images/product-image.png',
  '/assets/Images/placeholder-add-your-own.png', // Placeholder for "Add Your Own"
];

export default function EditImagePopup({isOpen, onClose}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl p-8 relative flex gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <div className="flex gap-6">
          {/* Left Image with Drag Note */}
          <div className="w-1/2 relative">
            <img
              src="/assets/Images/product-image.png" // You can dynamically change this
              alt="Selected"
              className="w-full h-[360px] object-cover"
            />
            <p className="text-center text-sm mt-2 text-gray-600">
              DRAG TO REPOSITION
            </p>
          </div>

          {/* Image Picker */}
          <div className="w-1/2 flex flex-wrap h-[220px] gap-x-4 gap-y-2 justify-start items-start">
            {images.map((img, index) => (
              <div key={index} className="cursor-pointer">
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="object-cover w-[100px] h-[100px]"
                />
                {index === images.length - 1 && (
                  <p className="text-center text-sm mt-2 text-gray-600">
                    Add Your Own
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
