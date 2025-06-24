import { Link } from "@remix-run/react";

function WhiteThemeButton({Text, link}) {
  return (
    <div className="flex justify-center items-center">
      <Link to={link}>
        <button className="border cursor-pointer mb-12 font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
          {Text}
        </button>
      </Link>
    </div>
  );
}

export default WhiteThemeButton;
