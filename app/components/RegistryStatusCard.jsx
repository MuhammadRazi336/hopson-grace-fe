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
    <div className={`bg-[#f5f2ed] rounded-sm p-6 lg:p-[1.51vw] xl:p-[1.51vw] 2xl:p-[1.51vw] w-64 lg:-w-[13.542vw] xl:-w-[13.542vw] 2xl:-w-[13.542vw] text-center relative shadow-sm max-[1024px]:w-full max-[1024px]:p-[20px] ${className}`}>
      <div className="uppercase text-lg lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.042vw] xl:leading-[1.042vw] 2xl:leading-[1.042vw] font-medium tracking-wide text-black mb-4 lg:mb-[1.042vw] xl:mb-[1.042vw] 2xl:mb-[1.042vw] max-[1024px]:text-[16px] max-[1024px]:leading-[16px]">
        Registry<br />Homepage Status:
      </div>
      {/* Toggle Switch */}
      <button
        type="button"
        aria-pressed={!isDraft}
        onClick={handleToggle}
        className={`mx-auto mb-[15px] w-[60px] h-[26px] lg:w-[3.125vw] xl:w-[3.125vw] 2xl:w-[3.125vw] lg:h-[1.354vw] xl:h-[1.354vw] 2xl:h-[1.354vw] flex items-center rounded-full border-2 transition-colors duration-200 focus:outline-none ${isDraft ? 'bg-white border-black' : 'bg-white border-black'}`}
      >
        <span
          className={`w-[26px] h-[22px] lg:h-[1.28vw] xl:h-[1.28vw] 2xl:h-[1.28vw] rounded-full shadow-md transform transition-transform duration-200 ${isDraft ? 'translate-x-0 bg-gray-300 w-[full]' : 'translate-x-3 bg-[#C52248] lg:w-[2.031vw] xl:w-[2.031vw] 2xl:w-[2.031vw] max-[1024px]:translate-x-8'}`}
        />
      </button>
      <div className="uppercase text-lg font-bold text-black tracking-wide lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[1024px]:text-[16px] max-[1024px]:leading-[16px]">
        {isDraft ? 'Draft' : 'Published'}
      </div>
    </div>
  );
};

export default RegistryStatusCard;