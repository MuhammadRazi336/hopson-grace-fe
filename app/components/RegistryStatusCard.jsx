import React, { useState } from 'react';

const RegistryStatusCard = ({ status: initialStatus = 'draft', registryId, token, className }) => {
  const [status, setStatus] = useState(initialStatus);
  const isDraft = status === 'draft';
  const apiBaseUrl = 'https://dev-hopsongrace.codup.io' || 'http://localhost:3040';
  
  // Toggle handler
  const handleToggle = async () => {
    const newStatus = isDraft ? 'published' : 'draft';
    try {
      const response = await fetch(`${apiBaseUrl}/api/registries/status/${registryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setStatus(newStatus);
        
        // Refresh the page after successful status update
        setTimeout(() => {
          window.location.reload();
        }, 500); // Wait 0.5 seconds before refreshing
      } else {
        console.error('Failed to update registry status');
      }
    } catch (error) {
      console.error('Error updating registry status:', error);
    }
  };

  return (
    <div className={`bg-[#f5f2ed] rounded-sm p-6 w-64 text-center relative shadow-sm ${className}`}>
      <div className="uppercase text-lg lg:text-[18px] lg:leading-[20px] font-medium tracking-wide text-black mb-4">
        Registry<br />Homepage Status:
      </div>
      {/* Toggle Switch */}
      <button
        type="button"
        aria-pressed={!isDraft}
        onClick={handleToggle}
        className={`mx-auto mb-[15px] w-[60px] h-[26px] flex items-center rounded-full border-2 transition-colors duration-200 focus:outline-none ${isDraft ? 'bg-white border-black' : 'bg-white border-black'}`}
      >
        <span
          className={`w-[26px] h-[22px] rounded-full shadow-md transform transition-transform duration-200 ${isDraft ? 'translate-x-0 bg-gray-300' : 'translate-x-8 bg-[#C52248]'}`}
        />
      </button>
      <div className="uppercase text-lg font-bold text-black tracking-wide lg:text-[18px] lg:leading-[18px]">
        {isDraft ? 'Draft' : 'Published'}
      </div>
    </div>
  );
};

export default RegistryStatusCard;