import React from 'react';

const NotificationCard = ({ count = 0, onView, className, loading = false, refreshing = false }) => (
  <div className={`bg-[#f5f2ed] rounded-sm p-6 lg:p-[1.51vw] xl:p-[1.51vw] 2xl:p-[1.51vw] w-64 lg:-w-[13.542vw] xl:-w-[13.542vw] 2xl:-w-[13.542vw] text-center relative shadow-sm max-[1024px]:w-full max-[1024px]:p-[20px] ${className}`}>
    {/* Notification Bell with Red Dot */}
    <div className="absolute top-[10px] right-4">
      <span className="relative inline-block">
        {/* Bell Icon (SVG) */}
        <svg width="24" height="29" fill="none" viewBox="0 0 24 24" className="inline-block align-middle">
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
        {/* Red Dot - only show if there are unread notifications */}
        {count > 0 && (
          <span className="absolute top-[7px] right-[2px] w-3 h-3 bg-red-600 rounded-full border-2 border-[#f5f2ed]"></span>
        )}
      </span>
    </div>
    {/* Number */}
    <div className="text-[48px] leading-[50px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-serif font-medium text-black mb-1 lg:mb-[0.573vw] xl:mb-[0.573vw] 2xl:mb-[0.573vw] relative">
      {loading ? '...' : refreshing ? '⟳' : count}
      <div className="w-[65px] h-1 lg:w-[3.385vw] xl:w-[3.385vw] 2xl:w-[3.385vw] lg:h-[0.156vw] xl:h-[0.156vw] 2xl:h-[0.156vw] bg-black mx-auto mt-0 lg:mb-[0.833vw] xl:mb-[0.833vw] 2xl:mb-[0.833vw] rounded"></div>
    </div>
    {/* Message */}
    <div className="uppercase text-base lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.042vw] xl:leading-[1.042vw] 2xl:leading-[1.042vw] font-medium tracking-wide text-black mb-[23px] lg:mb-[1.198vw] xl:mb-[1.198vw] 2xl:mb-[1.198vw]">
      {loading ? (
        <>
          Loading<br />notifications...
        </>
      ) : refreshing ? (
        <>
          Refreshing<br />notifications...
        </>
      ) : count > 0 ? (
        <>
          You have<br />new messages
        </>
      ) : (
        <>
          No new<br />messages
        </>
      )}
    </div>
    {/* View Link */}
    <button
      onClick={onView}
      disabled={loading || refreshing}
      className={`uppercase cursor-pointer font-bold text-lg tracking-wide text-black lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] border-b-2 border-[#1F1D1B] hover:text-gray-700 ${(loading || refreshing) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Loading...' : refreshing ? 'Refreshing...' : 'View'}
    </button>
  </div>
);

export default NotificationCard;