const ErrorText = ({data, className = ''}) => {
  const isError = data?.statusCode >= 400;
  const message = Array.isArray(data?.message) ? data?.message[0] : data?.message;
  if (!message) return null;
  return (
    <div role={isError ? 'alert' : undefined} className={`mt-3 text-left ${className}`}>
      <span className={`font-medium text-[18px] ${isError ? 'text-[#B00020]' : 'text-gray-800'}`}>
        {message}
      </span>
    </div>
  );
};

export default ErrorText;
