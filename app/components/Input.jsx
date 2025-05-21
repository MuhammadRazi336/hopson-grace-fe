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
  return (
    <div className="flex flex-col mb-2">
      <label htmlFor={name} className={`text-sm font-normal uppercase tracking-wider ${classNameLabel}`}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-2 p-2 border border-gray-300 rounded w-80 ${className} ${error ? 'border-red-500' : ''}`}
        {...rest}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1">{error}</span>
      )}
    </div>
  );
}
