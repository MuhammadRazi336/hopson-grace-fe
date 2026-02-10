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
        className={`relative mx-auto mb-[15px] inline-flex h-8 w-16 items-center rounded-full bg-white border-2 border-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:h-[2vw] lg:w-[4vw]`}
      >
        <span
          className={`absolute left-[1px] top-[1.2px] h-6 w-6 rounded-full shadow-lg transform transition-colors transition-transform duration-300 lg:h-[1.6vw] lg:w-[1.6vw] ${
            isDraft 
              ? 'bg-[var(--color-gray-300,#d1d5db)] translate-x-0' 
              : 'bg-[#C52248] translate-x-8 lg:translate-x-[2vw]'
          }`}
        />
      </button>
      <div className="uppercase text-lg font-bold text-black tracking-wide lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[1024px]:text-[16px] max-[1024px]:leading-[16px]">
        {isDraft ? 'Draft' : 'Published'}
      </div>
    </div>
  );
};

export default RegistryStatusCard;