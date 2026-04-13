import { useState } from 'react';

export default function Input({
  label,
  name,
  value,
  onChange,
  className,
  classNameLabel,
  placeholder,
  type = 'text',
  error,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col mb-2 relative">
      <label htmlFor={name} className={`text-sm font-normal uppercase tracking-wider ${classNameLabel}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-2 p-2 border border-gray-300 rounded w-80 ${type === 'password' ? 'pr-12' : ''} ${className} ${error ? 'border-[#FD446F] max-[1024px]:h-[47px] max-[1024px]:py-0 focus:border-[#FD446F] focus:ring-[#FD446F]' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...rest}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[50%] transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <div id={`${name}-error`} role="alert" className="mt-1 text-left">
          <span className="text-[#ffffff] font-medium text-[18px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[2.083vw] xl:leading-[2.083vw] 2xl:leading-[2.083vw] max-[1024px]:text-[17px]">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
