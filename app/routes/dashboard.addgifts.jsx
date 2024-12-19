import CustomSelect from "~/components/CustomSelect.jsx";
import ButtonComponent from "~/components/Button.jsx";
import RegistryProduct from "~/components/RegistryProduct.jsx";
import { useState } from "react";

const index = () => {
  const options = [
    { label: "Wedding Registry", value: "wedding" },
    { label: "Baby Registry", value: "baby" },
    { label: "Birthday Registry", value: "birthday" }
  ];
  const [selected, setSelected] = useState({
    label: "Wedding Registry",
    value: "wedding"
  });
  const products = [
  { image: "https://via.placeholder.com/150", productName: "Product One", price: 499.99, description: "Description for Product One" },
  { image: "https://via.placeholder.com/150", productName: "Product Two", price: 299.99, description: "Description for Product Two" },
  { image: "https://via.placeholder.com/150", productName: "Product Three", price: 199.99, description: "Description for Product Three" },
  { image: "https://via.placeholder.com/150", productName: "Product Four", price: 99.99, description: "Description for Product Four" },
];

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

export default index;
