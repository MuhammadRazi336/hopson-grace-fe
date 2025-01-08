export default function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
  ...rest
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        required
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 p-2 border border-gray-300 rounded"
        {...rest}
      />
    </div>
  );
}
