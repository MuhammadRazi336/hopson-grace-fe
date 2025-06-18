import React, {useState, useEffect, useRef} from 'react';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import {Link} from '@remix-run/react';
import {Header} from '~/components/Header';

const CustomTabs = ({
  tabsData,
  defaultActive = 1,
  className,
  headerClassName,
  bodyClassName,
  onTabRef,
  activeTab: externalActiveTab,
}) => {
  // Use label as the unique identifier for activeTab
  const [activeTab, setActiveTab] = useState(tabsData[defaultActive - 1]?.label || tabsData[0]?.label);
  const tabRefs = useRef({});

  // Sync with external activeTab if provided
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  // Call onTabRef with the DOM node of the active tab (by label)
  useEffect(() => {
    if (onTabRef && tabRefs.current && activeTab && tabRefs.current[activeTab]) {
      onTabRef(tabRefs.current[activeTab]);
    }
  }, [activeTab, onTabRef]);

  return (
    <>
      <Header />
      <div className="w-full">
        <Tabs value={activeTab} className={`w-full ${className}`}>
          <TabsHeader className={`w-full shadow-md flex justify-between ${headerClassName}`}>
            {tabsData.map(({label, route}) => (
              <Link
                key={label}
                ref={el => { tabRefs.current[label] = el; }}
                className={`flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group ${activeTab === label ? 'font-bold text-black' : 'font-normal text-gray-600'}`}
                to={route}
                onClick={() => setActiveTab(label)}
              >
                <Tab value={label} className="w-full bg-transparent shadow-none p-0 min-w-0">
                  <span className="relative inline-block">
                    {label}
                    <span
                      className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${activeTab === label ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full'}`}
                      style={{width: activeTab === label ? '100%' : '0%', minWidth: '24px'}}
                    />
                  </span>
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
      </div>
    </>
  );
};

export default CustomTabs;
