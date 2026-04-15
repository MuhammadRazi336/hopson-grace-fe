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

const MINI_TUTORIAL_STORAGE_KEY = '@DashboardMiniTutorialDismissed';

const CustomTabs = ({
  tabsData,
  defaultActive = 1,
  className,
  headerClassName,
  bodyClassName,
  onTabRef,
  activeTab: externalActiveTab,
}) => {
  
  // Handle logout functionality
  const handleLogout = () => {
    const miniTutorialDismissedAt = localStorage.getItem(MINI_TUTORIAL_STORAGE_KEY);
    localStorage.clear();
    sessionStorage.clear();
    if (miniTutorialDismissedAt) {
      localStorage.setItem(MINI_TUTORIAL_STORAGE_KEY, miniTutorialDismissedAt);
    }
    
    // Clear specific items to be sure
    localStorage.removeItem('@token');
    localStorage.removeItem('@Token');
    localStorage.removeItem('@User');
    localStorage.removeItem('@Registry');
    
    // Submit form to logout route to clear server-side session
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout';
    document.body.appendChild(form);
    form.submit();
  };
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

  // Apply CSS immediately on mount to prevent flash of white background
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .material-tailwind-tabs .material-tailwind-tab,
      .material-tailwind-tabs .material-tailwind-tab-active,
      .material-tailwind-tabs [data-value],
      .material-tailwind-tabs div[data-projection-id],
      .material-tailwind-tabs div.bg-white,
      .material-tailwind-tabs div.absolute.inset-0.z-10.h-full.bg-white.rounded-md.shadow[data-projection-id],
      .bg-white {
        background-color: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{ 
        __html: `
          /* Target all Material Tailwind tab elements immediately */
          .material-tailwind-tabs .material-tailwind-tab,
          .material-tailwind-tabs .material-tailwind-tab-active,
          .material-tailwind-tabs [data-value],
          .material-tailwind-tabs div[data-projection-id],
          .material-tailwind-tabs div.bg-white,
          .material-tailwind-tabs div.absolute.inset-0.z-10.h-full.bg-white.rounded-md.shadow[data-projection-id] {
            background-color: transparent !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          
          /* Target any element with bg-white class */
          .bg-white {
            background-color: transparent !important;
          }
          
          /* Ensure immediate application */
          * {
            transition: none !important;
          }
          
          /* Target the first tab specifically */
          .material-tailwind-tabs .material-tailwind-tab:first-child,
          .material-tailwind-tabs .material-tailwind-tab-active:first-child {
            background-color: transparent !important;
          }
        `
      }} />
      <div className="w-full">
        <Tabs value={activeTab} className={`w-full ${className}`}>
          <TabsHeader className={`w-full shadow-md flex justify-between bg-transparent ${headerClassName}`}>
            {tabsData.map(({label, route, isLogout}) => {
              if (isLogout) {
                // Handle logout tab differently - use button instead of Link
                return (
                  <button
                    key={label}
                    ref={el => { tabRefs.current[label] = el; }}
                    className={`flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600`}
                    onClick={handleLogout}
                  >
                    <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent">
                      <div className="z-20 text-inherit">
                        <span className="relative inline-block">
                          {label}
                          <span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }
              
              // Regular tab with Link
              return (
                <Link
                  key={label}
                  ref={el => { tabRefs.current[label] = el; }}
                  className={`flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group ${activeTab === label ? 'font-bold text-black' : 'font-normal text-gray-600'}`}
                  to={route}
                  onClick={() => setActiveTab(label)}
                >
                  <Tab 
                    value={label} 
                    className="w-full shadow-none p-0 min-w-0 !bg-transparent"
                    style={{backgroundColor: 'transparent'}}
                  >
                    <span className="relative inline-block">
                      {label}
                      <span
                        className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${activeTab === label ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full'}`}
                        style={{width: activeTab === label ? '100%' : '0%', minWidth: '24px'}}
                      />
                    </span>
                  </Tab>
                </Link>
              );
            })}
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