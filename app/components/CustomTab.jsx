import React from 'react';
import Sliderwithcontent from './Sliderwithcontent';

const CustomTab = ({ tabsData, featuredRegistryData }) => {
  // Transform the data structure to match what Sliderwithcontent expects
  const transformData = (data) => {
    // Add safety checks
    if (!data) {
      console.log('🔍 DEBUG: No data provided to CustomTab');
      return null;
    }
    
    // Case 1: Data is already in the correct format (from home page)
    if (data.parentCollection && data.subCollections) {
      console.log('🔍 DEBUG: Data already in correct format (home page structure)');
      return data;
    }
    
    // Case 2: Data is an array of collections (from dashboard addgifts)
    if (Array.isArray(data)) {
      console.log('🔍 DEBUG: Data is array, transforming to expected format');
      
      if (data.length === 0) {
        console.log('🔍 DEBUG: Collections array is empty');
        return null;
      }
      
      // Use the first collection as the parent and all collections as sub-collections
      const parentCollection = data[0];
      
      // Create a mock sub-collection structure from the collections
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
    
    // Case 3: Unknown data structure
    console.log('🔍 DEBUG: Unknown data structure:', typeof data, data);
    return null;
  };

  const transformedData = transformData(featuredRegistryData);

  return (
    <div className="container mx-auto px-4">
      {/* Show content directly without tabs */}
      {transformedData ? (
        <Sliderwithcontent featuredRegistryData={transformedData} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No registry data available</p>
          <p className="text-sm text-gray-400 mt-2">
            Data type: {typeof featuredRegistryData} | 
            Data: {JSON.stringify(featuredRegistryData, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomTab;
