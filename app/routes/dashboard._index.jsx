import CustomSelect from "~/components/CustomSelect.jsx";
import Card from "~/components/Card.jsx";
import Accordiance from "~/components/Accordiance.jsx";
import ButtonComponent from "~/components/Button.jsx";
import { useState } from "react";

const index = () => {

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

export default index;
