import React from 'react';

const NotificationCard = ({ count = 0, onView, className, loading = false, refreshing = false }) => (
  <div className={`bg-[#f5f2ed] rounded-sm p-6 w-64 text-center relative shadow-sm ${className}`}>
    {/* Notification Bell with Red Dot */}
    <div className="absolute top-4 right-4">
      <span className="relative inline-block">
        {/* Bell Icon (SVG) */}
        <svg width="24" height="29" fill="none" viewBox="0 0 24 24" className="inline-block align-middle">
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
        {/* Red Dot - only show if there are unread notifications */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#f5f2ed]"></span>
        )}
      </span>
    </div>
    {/* Number */}
    <div className="text-[48px] leading-[50px] font-serif font-medium text-black mb-1 relative">
      {loading ? '...' : refreshing ? '⟳' : count}
      <div className="w-[65px] h-1 bg-black mx-auto mt-0 mb-[16px] rounded"></div>
    </div>
    {/* Message */}
    <div className="uppercase text-base lg:text-[18px] lg:leading-[20px] font-medium tracking-wide text-black mb-[23px]">
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
      className={`uppercase font-bold text-lg tracking-wide text-black lg:text-[18px] lg:leading-[18px] border-b-2 border-[#1F1D1B] hover:text-gray-700 ${(loading || refreshing) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Loading...' : refreshing ? 'Refreshing...' : 'View'}
    </button>
  </div>
);

export default NotificationCard;