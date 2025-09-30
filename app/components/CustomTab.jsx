import React, { useState } from 'react';
import Sliderwithcontent from './Sliderwithcontent';

const CustomTab = ({ tabsData, featuredRegistryData }) => {
  const [activeTab, setActiveTab] = useState(tabsData?.[0]?.value || 1);

  // Transform the data structure based on active tab
  const transformData = (data, activeTabValue) => {
    // Add safety checks
    if (!data) {
      console.log('🔍 DEBUG: No data provided to CustomTab');
      return null;
    }
    
    // Case 1: New structured data with real/themed categories
    if (data.real || data.themed) {
      console.log('🔍 DEBUG: Data has categorized structure');
      
      let selectedData = null;
      
      // Select data based on active tab
      switch (activeTabValue) {
        case 1: // REAL REGISTRIES
          selectedData = data.real;
          break;
        case 2: // THEMED REGISTRIES
          selectedData = data.themed;
          break;
        default:
          selectedData = data.real; // Default to real registries
      }
      
      console.log('🔍 DEBUG: Selected data for tab', activeTabValue, ':', selectedData);
      
      if (selectedData && selectedData.parentCollection && selectedData.subCollections) {
        return selectedData;
      }
      
      return null;
    }
    
    // Case 2: Legacy data structure (from home page)
    if (data.parentCollection && data.subCollections) {
      console.log('🔍 DEBUG: Data already in correct format (home page structure)');
      return data;
    }
    
    // Case 3: Data is an array of collections (legacy)
    if (Array.isArray(data)) {
      console.log('🔍 DEBUG: Data is array, transforming to expected format');
      
      if (data.length === 0) {
        console.log('🔍 DEBUG: Collections array is empty');
        return null;
      }
      
      const parentCollection = data[0];
      const subCollections = data.map(collection => ({
        id: collection.id,
        title: collection.title,
        image: collection.image,
        products: collection.products
      }));

      return {
        parentCollection: {
          title: parentCollection.title,
          image: parentCollection.image
        },
        subCollections: subCollections
      };
    }
    
    // Case 4: Unknown data structure
    console.log('🔍 DEBUG: Unknown data structure:', typeof data, data);
    return null;
  };

  const transformedData = transformData(featuredRegistryData, activeTab);

  return (
    <div className="container mx-auto px-4">
      {/* Render tabs if tabsData is provided */}
      {tabsData && tabsData.length > 0 && (
        <div className="flex justify-center mb-8">
          <div className="flex gap-8">
            {tabsData.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-6 py-3 text-[18px] cursor-pointer transition-colors duration-200 relative ${
                  activeTab === tab.value
                    ? 'text-black font-bold'
                    : 'font-normal hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black mx-auto" 
                       style={{ width: '80%' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show content based on active tab */}
      {transformedData ? (
        <Sliderwithcontent featuredRegistryData={transformedData} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {featuredRegistryData === undefined ? 'Loading ready-made registries...' : 'No ready-made registries found'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Data type: {typeof featuredRegistryData} | 
            Structure: {featuredRegistryData?.subCollections ? 'Has subCollections' : 'No subCollections'} |
            Sub-collections count: {featuredRegistryData?.subCollections?.length || 0}
          </p>
          {featuredRegistryData && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left max-w-2xl mx-auto">
              <p className="text-sm font-semibold mb-2">Raw Data:</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(featuredRegistryData, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">If this message persists, please check the console for any errors.</p>
        </div>
      )}
    </div>
  );
};

export default CustomTab;
