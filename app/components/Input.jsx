export default function Input({
  label,
  name,
  value,
  onChange,
  className,
  classNameLabel,
  placeholder,
  type = 'text',
  ...rest
}) {
  return (
    <div className="flex flex-col">
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
        className={`mt-2 p-2 border border-gray-300 rounded w-80 ${className}`}
        {...rest}
      />
    </div>
  );
}
