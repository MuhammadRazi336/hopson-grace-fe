import React from 'react'

const RegistryStatusCard = ({ status = 'draft', onToggle, className }) => {
  const isDraft = status === 'draft';
  return (
    <div className={`bg-[#f5f2ed] rounded-sm p-6 w-64 text-center relative shadow-sm ${className}`}>
      <div className="uppercase text-lg font-medium tracking-wide text-black mb-4">
        Registry<br />Homepage Status:
      </div>
      {/* Toggle Switch */}
      <button
        type="button"
        aria-pressed={!isDraft}
        onClick={onToggle}
        className={`mx-auto mb-4 w-16 h-8 flex items-center rounded-full border-2 border-black transition-colors duration-200 focus:outline-none bg-white ${isDraft ? '' : 'bg-green-500 border-green-600'}`}
      >
        <span
          className={`w-7 h-7 rounded-full bg-gray-300 shadow-md transform transition-transform duration-200 ${isDraft ? 'translate-x-0' : 'translate-x-8 bg-green-600'}`}
        />
      </button>
      <div className="uppercase text-lg font-bold text-black tracking-wide">
        {isDraft ? 'Draft' : 'Published'}
      </div>
    </div>
  )
}

export default RegistryStatusCard