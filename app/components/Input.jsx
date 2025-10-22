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
  showPasswordTooltip = false,
  ...rest
}) {
  return (
    <div className="flex flex-col mb-2 relative">
      <label htmlFor={name} className={`text-sm font-normal uppercase tracking-wider ${classNameLabel}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-2 p-2 border border-gray-300 rounded w-80 ${className} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...rest}
        />
        {showPasswordTooltip && type === 'password' && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 group">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-5 h-5 text-gray-400 cursor-help"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="font-semibold mb-2">Password Requirements:</div>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value.length >= 6 ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  At least 6 characters
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(value) ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(value) ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  One lowercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(value) ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  One number
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div id={`${name}-error`} role="alert" className="mt-1 text-left">
          <span className="text-[#B00020] font-medium text-[18px] max-[1024px]:text-[17px]">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
