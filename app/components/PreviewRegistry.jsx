import { Link, useLoaderData } from "@remix-run/react";

export async function loader({context}) {
  const user = await context.session.get('@User');
  return {
    user,
  }
}

function PreviewRegistry() {
  const {user} = useLoaderData();
  const userId = user.user.id;
  console.log(user.user.id);
  return (
    <Link to={`/couple/single/${userId}`}>
    <div className="absolute top-0 right-12 max-w-[200px] w-[20%] min-h-[100px] bg-[#446184] z-10">
      <div className="container mx-auto pt-3">
        <img
          src="/assets/Images/share-icon.png"
          alt="preview"
          className="w-10 mx-auto"
        />
        <h2 className="text-white text-sm text-center font-bold mt-2">
          PREVIEW MY <br /> REGISTRY
        </h2>
      </div>
    </div>
    </Link>
  );
}

export default PreviewRegistry;
