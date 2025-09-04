import { Link } from "@remix-run/react";

function PreviewRegistry() {
  // Remove the loader and useLoaderData since this component is used in public routes
  // where user data might not be available
  
  return (
    <div className="absolute top-0 right-12 max-w-[260px] w-[20%] min-h-[141px] bg-[#446184] z-10 flex flex-col items-center justify-center">
      <div className="container mx-auto pt-3">
        <img
          src="/assets/Images/share-icon.png"
          alt="preview"
          className="w-10 mx-auto"
        />
        <h2 className="text-white text-[18px] text-center font-bold mt-2">
          PREVIEW MY <br /> REGISTRY
        </h2>
      </div>
    </div>
  );
}

export default PreviewRegistry;
