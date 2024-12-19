import CustomTabs from "~/components/Tabs.jsx";
import CustomSelect from "~/components/CustomSelect";
import { useState, useEffect } from "react";
import Card from "~/components/Card.jsx";
import Accordiance from "~/components/Accordiance.jsx";
import ButtonComponent from "~/components/Button.jsx";
import ProductCard from "~/components/Product";
import FundCard from "~/components/FundCard";
import RegistryProduct from "~/components/RegistryProduct.jsx";
import { products } from "~/data";
import { requireAuth } from "~/utils/auth-guard.js";
import { defer, redirect } from "@shopify/remix-oxygen";
import { Outlet } from "@remix-run/react";

export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  // const { context, request } = args;
  //
  // // Await the critical data required to render initial state of the page
  // const user = await requireAuth(context);
  // if (!user) {
  //   return redirect("/login");
  // } else if (!user?.user?.isOnboard) {
  //   const getUser = await context.ClientGet(`users/${user.user.id}`, context);
  //   const sessionUser = {
  //     accessToken: user.accessToken,
  //     ...getUser
  //   };
  //   context.session.set("@User", sessionUser);
  //   const cookie = await context.session.commit();
  //   return redirect("/onboarding", {
  //     headers: {
  //       "Set-Cookie": cookie
  //     }
  //   });
  // } else {
  //   return defer({ user });
  // }
  return null;
}

const Dashboard_index = () => {
  const tabData = [
    {
      label: "Registry Detail",
      value: "home",
      desc: <RegistryTab />
    },
    {
      label: "Registry Homepage",
      value: "profile",
      desc: <RegistryProfile />
    },
    {
      label: "Add or Edit Gifts",
      value: "addgifts",
      desc: <AddEditGift />
    },
    {
      label: "Add Cash Funds",
      value: "cashfunds",
      desc: <h1>Add Cash Funds</h1>
    },
    {
      label: "Gifts & Thank You Tracker",
      value: "giftsthanks",
      desc: <h1>Gifts & Thank You Tracker</h1>
    },
    {
      label: "Ship My Gifts",
      value: "shipgifts",
      desc: <h1>Ship My Gifts</h1>
    },
    {
      label: "Contact My Advisor",
      value: "contactadvisor",
      desc: <h1>Contact My Advisor</h1>
    }
  ];

  return (
    <div>
      <div>
        <CustomTabs
          tabsData={tabData}
          defaultActive={1}
          headerClassName="bg-gray-100 rounded-md"
        />
      </div>
    </div>
  );
};

export default Dashboard_index;

const RegistryTab = (props) => {
  const [selected, setSelected] = useState({
    label: "Wedding Registry",
    value: "wedding"
  });

  const options = [
    { label: "Wedding Registry", value: "wedding" },
    { label: "Baby Registry", value: "baby" },
    { label: "Birthday Registry", value: "birthday" }
  ];
  const cardData = [
    { value: "$100", label: "Gifts Available", selectable: true },
    { value: "$52", label: "Gifts Purchased", selectable: false },
    { value: "$22,102", label: "Registry Fund Balance", selectable: false }
  ];

  const [selectedCards, setSelectedCards] = useState([]);

  const handleCardSelect = (isSelected, index) => {
    const updatedSelection = isSelected
      ? [...selectedCards, index]
      : selectedCards.filter((cardIndex) => cardIndex !== index);
    setSelectedCards(updatedSelection);
  };

  return (
    <div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-4 flex-2">
          <div>
            <CustomSelect
              label="Registry Collection:"
              options={options}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
          <div>
            <h2>Gift Tracker</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className={`${
                    index === cardData.length - 1 && cardData.length % 2 !== 0
                      ? "col-span-full" // Make the last card take full width if odd
                      : ""
                  }`}
                >
                  <Card
                    key={index}
                    value={card.value}
                    label={card.label}
                    selectable={card.selectable}
                    onCardSelect={(isSelected) =>
                      handleCardSelect(isSelected, index)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="my-2">Registry Checklist</h1>
            <h4 className="font-semibold">Completed</h4>
            <div className="my-2">
              <Accordiance
                title="How many Guests are invited?"
                ContentComponent={() => <div>My Content</div>}
              />
            </div>
            <div className="my-2">
              <Accordiance
                title="Where should we ship your gifts?"
                ContentComponent={() => <div>My Content</div>}
              />
            </div>
            <div>
              <h4 className="font-semibold">To-Do</h4>
              <div className="my-2">
                <Accordiance
                  title="Add gifts to your registry"
                  ContentComponent={() => <div>My Content</div>}
                />
              </div>
              <div className="my-2">
                <Accordiance
                  title="Add a cash funds to your registry"
                  ContentComponent={() => <div>My Content</div>}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-2">
          <div>
            <h1 className="text-xl font-bold mb-2">Notifications</h1>
            <div className=" p-4 rounded-md flex">
              <div className="flex-1 border rounded-md p-4 mr-4 bg-gray-300">
                {/* Empty card */}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-lg font-normal my-5">
                  Want to see how your registry appears to your guests?
                </h2>
                <p className="mt-2 text-center my-5">Preview as a guest</p>
                <ButtonComponent
                  className="mt-5 w-1/1.3"
                  text="Preview Registry"
                />
              </div>
            </div>
          </div>
          <div>
            <div>
              <h1 className="text-xl font-bold mb-2">Your Registry Advisor</h1>
              <div className=" p-4 rounded-md flex">
                <div className="flex-1 border rounded-md p-4 mr-4 bg-gray-300">
                  {/* Empty card */}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-lg font-semibold">Jocelyn Robinson</h2>
                  <h3 className="font-normal">
                    jocelyn@registry.com | 403-123-4567
                  </h3>
                  <p className="mt-2 mt-5 mb-3">
                    Hi! I'm your registry advisor. I'm here to help you through
                    the process.
                  </p>
                  <ButtonComponent
                    className="mt-5 w-1/1.3"
                    text="Contact Your Advisor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegistryHomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-4xl border bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
              <button className="bg-white text-gray-700 border border-gray-400 px-4 py-2 rounded-lg">
                Upload New Photo
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="coupleName">
                  Couple Name
                </label>
                <input
                  id="coupleName"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="hashtag">
                  Hashtag
                </label>
                <input
                  id="hashtag"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="weddingDate">
                  Wedding Date
                </label>
                <input
                  id="weddingDate"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="weddingTime">
                  Wedding Time
                </label>
                <input
                  id="weddingTime"
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="province">
                  Province
                </label>
                <input
                  id="province"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="guests">
                  Number of Guests
                </label>
                <input
                  id="guests"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-medium mb-1" htmlFor="welcomeMessage">
            Welcome Message
          </label>
          <textarea
            id="welcomeMessage"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28"
          ></textarea>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg">
            Change Page Style
          </button>
          <button className="bg-black text-white px-6 py-2 rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistryProfile = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Registry Homepage</h1>
      <div className="flex flex-col space-x-4 md:flex-row">
        <div className="flex-1 h-64 bg-gray-300 rounded-lg">
          <div className="h-64"></div>
        </div>

        <div className="flex-1 mt-4 lg:mt-0">
          <h2 className="text-xl font-semibold">Couple Name</h2>
          <p className="text-gray-600">#CoupleHashtag</p>
          <p className="text-gray-600 mt-2">
            January 1 2025 2pm | Whispering Pines Event Centre <br />
            Calgary, Alberta, Canada
          </p>
          <h3 className="text-lg font-semibold mt-4">Welcome Message</h3>
          <p className="text-gray-600">
            Please enter any message you want to share with your guests.
          </p>
          <div className="mt-4 flex space-x-2">
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Share Registry
            </button>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Edit Registry Page
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-300 pt-4 border-b">
        <Accordiance
          title="Selected Wedding Registry Gifts"
          ContentComponent={() => <ProductPage />}
        />
      </div>

      <div className="mt-4 border-t border-gray-300 pt-4 border-b">
        <Accordiance
          title="Selected Wedding Cash Funds"
          ContentComponent={() => <FundPage />}
        />
      </div>
    </div>
  );
};

const ProductPage = () => {
  return (
    <div className="container p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            productName={product.productName}
            productImage={product.productImage}
            price={product.price}
            collected={product.collected}
            isGroupGift={product.isGroupGift}
            onContributorsClick={() =>
              console.log(`Contributors for ${product.productName}`)
            }
          />
        ))}
      </div>
    </div>
  );
};

const FundPage = () => {
  // Dummy data for the funds
  const fundData = [
    {
      id: 1,
      title: "Honeymoon Fund",
      totalAmount: 4000,
      collectedAmount: 100
    },
    {
      id: 2,
      title: "Home Down Payment",
      totalAmount: 15000,
      collectedAmount: 100
    },
    {
      id: 3,
      title: "Date Night Fund",
      totalAmount: 100,
      collectedAmount: 100
    },
    {
      id: 4,
      title: "Travel Fund",
      totalAmount: 5000,
      collectedAmount: 2500
    },
    {
      id: 5,
      title: "Education Fund",
      totalAmount: 20000,
      collectedAmount: 12000
    }
  ];

  // Function to handle view contributors button click
  const handleViewContributors = (fundName) => {
    console.log(`Viewing contributors for ${fundName}`);
  };

  return (
    <div className="flex justify-center items-start flex-wrap p-4 bg-gray-100">
      {fundData.map((fund) => (
        <FundCard
          key={fund.id} // Use a unique key for each card
          title={fund.title}
          totalAmount={fund.totalAmount}
          collectedAmount={fund.collectedAmount}
          onViewContributors={() => handleViewContributors(fund.title)}
        />
      ))}
    </div>
  );
};

const AddEditGift = () => {
  const options = [
    { label: "Wedding Registry", value: "wedding" },
    { label: "Baby Registry", value: "baby" },
    { label: "Birthday Registry", value: "birthday" }
  ];
  const [selected, setSelected] = useState({
    label: "Wedding Registry",
    value: "wedding"
  });
  // const products = [
//   { image: "https://via.placeholder.com/150", productName: "Product One", price: 499.99, description: "Description for Product One" },
//   { image: "https://via.placeholder.com/150", productName: "Product Two", price: 299.99, description: "Description for Product Two" },
//   { image: "https://via.placeholder.com/150", productName: "Product Three", price: 199.99, description: "Description for Product Three" },
//   { image: "https://via.placeholder.com/150", productName: "Product Four", price: 99.99, description: "Description for Product Four" },
// ];
  return (<div className="max-w-4xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
    <div className={"flex flex-row gap-4"}>
      <div className={"flex-1"}>
        <CustomSelect
          options={options}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div className={"flex-1"}>
        <CustomSelect
          options={options}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div className={"flex-1"}>
        <CustomSelect
          options={options}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div className={"flex-1"}>
        <ButtonComponent className={"flex-1 w-full"} text={"Apply Filter"} />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {products.map((product, index) => (<RegistryProduct
        key={index}
        image={product.image}
        productName={product.productName}
        price={product.price}
        description={product.description}
        onAddToRegistry={(quantity, isGroupGift) => console.log(`Added ${quantity} items to cart, Group Gift: ${isGroupGift}`)}
        onGroupGiftTagChange={(isGroupGift) => console.log(`Group Gift tag changed: ${isGroupGift}`)}
      />))}
    </div>
  </div>);
};
