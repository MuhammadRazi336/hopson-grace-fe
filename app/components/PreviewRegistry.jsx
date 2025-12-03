import { Link } from "@remix-run/react";

function PreviewRegistry({ className = "", useAbsolutePosition = true }) {
  // Remove the loader and useLoaderData since this component is used in public routes
  // where user data might not be available
  
  const positionClass = useAbsolutePosition ? "absolute top-0 right-12" : "";
  const widthClass = useAbsolutePosition ? "w-[20%]" : "w-full";
  
  return (
    <div className={`max-w-full ${widthClass} min-h-[4.896vw] bg-[#446184] z-10 flex flex-col items-center justify-center ${positionClass} ${className}`}>
      <div className="flex items-center justify-center gap-[1.042vw] w-full px-[1vw]">
        <img
          src="/assets/Images/share-icon.png"
          alt="preview"
          className="w-[2.188vw] h-[2.188vw]"
        />
        <h2 className="text-white text-[0.833vw] leading-[0.938vw] text-center font-bold m-0">
          PREVIEW MY REGISTRY
        </h2>
      </div>
    </div>
  );
}

export default PreviewRegistry;
