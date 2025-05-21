import React, { useState } from 'react';
import Sliderwithcontent from './Sliderwithcontent';

const CustomTab = () => {
    // Define an array of tabs
    const tabs = [
        { id: 1, label: 'REAL REGISTRIES', content: <Sliderwithcontent /> },
        { id: 2, label: 'THEMED REGISTRIES', content: <TabContent2 /> },
        { id: 3, label: 'LOREM IPSUM', content: <TabContent3 /> },
    ];

    // State to manage the active tab
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return ( 
        <div className='container'>
            <div className='px-6 lg:px-3 mx-auto mt-10 lg:mt-[100px]'>
                <div className="tabs flex gap-4 lg:gap-10 justify-center">
                    {tabs.map(tab => (
                        <button 
                            className={`font-bold text-sm lg:text-lg lg:leading-[18px] tracking-[0.08em] text-center ${activeTab === tab.id ? 'tabactive' : ''}`} 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="tab-content mt-[84px]">
                    {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
            </div>
        </div>
     );
}

// Tab content components
const TabContent1 = () => <div>Content for Tab 1</div>;
const TabContent2 = () => <div>Content for Tab 2</div>;
const TabContent3 = () => <div>Content for Tab 3</div>;

export default CustomTab;