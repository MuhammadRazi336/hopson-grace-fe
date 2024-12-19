import React, { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import { Link } from "@remix-run/react";

const CustomTabs = ({
                      tabsData,
                      defaultActive = "",
                      className,
                      headerClassName,
                      bodyClassName
                    }) => {
  const [activeTab, setActiveTab] = useState(defaultActive);

  return (
    <Tabs value={activeTab} className={className}>
      <TabsHeader className={headerClassName}>
        {tabsData.map(({ label, value }) => (
          <Link className={`px-4 py-2 text-sm font-medium rounded-md transition-all ease-in-out
              hover:bg-gray-200 hover:text-gray-900
              ${activeTab === value ? "bg-gray-300 text-gray-900" : "text-gray-600"}`} to={value}>
            <Tab
              key={value}
              value={value}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </Tab>
          </Link>
        ))}
      </TabsHeader>

      {/* Tabs Body */}
      {/*<TabsBody className={bodyClassName}>*/}
      {/*  {tabsData.map(({ value, desc }) => (*/}
      {/*    <TabPanel key={value} value={value}>*/}
      {/*      {desc}*/}
      {/*    </TabPanel>*/}
      {/*  ))}*/}
      {/*</TabsBody>*/}
    </Tabs>
  );
};

export default CustomTabs;
