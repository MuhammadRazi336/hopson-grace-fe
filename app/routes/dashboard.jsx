// import { Link } from "remix";
import { Outlet } from "@remix-run/react";
import CustomTabs from "~/components/Tabs.jsx";

const Dashboard_index = () => {
  const tabData = [
    {
      label: "Registry Detail",
      value: "",
    },
    {
      label: "Registry Homepage",
      value: "profile",
    },
    {
      label: "Add or Edit Gifts",
      value: "addgifts",
    },
    {
      label: "Add Cash Funds",
      value: "cashfunds",
    },
    {
      label: "Gifts & Thank You Tracker",
      value: "giftsthanks",
    },
    {
      label: "Ship My Gifts",
      value: "shipgifts",
    },
    {
      label: "Contact My Advisor",
      value: "contactadvisor",
    }
  ];

  return (
    <div>
      <div>
        <CustomTabs
          tabsData={tabData}
          defaultActive="registry"
          headerClassName="bg-gray-100 rounded-md"
        />
      </div>
      <Outlet />
    </div>
  );
};

export default Dashboard_index;
