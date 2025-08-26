import React, {useState} from 'react';
import Sliderwithcontent from './Sliderwithcontent';

const CustomTab = ({ featuredRegistryData }) => {
  // Define an array of tabs
  // const tabs = [
  //     { id: 1, label: 'REAL REGISTRIES', content: <Sliderwithcontent /> },
  //     { id: 2, label: 'THEMED REGISTRIES', content: <TabContent2 /> },
  //     { id: 3, label: 'LOREM IPSUM', content: <TabContent3 /> },
  // ];

  // // State to manage the active tab
  // const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="container">
      <Sliderwithcontent featuredRegistryData={featuredRegistryData} />
    </div>
  );
};

// Tab content components
// const TabContent2 = () => <div>Content for Tab 2</div>;
// const TabContent3 = () => <div>Content for Tab 3</div>;

export default CustomTab;
