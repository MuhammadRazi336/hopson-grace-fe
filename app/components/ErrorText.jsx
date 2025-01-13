const ErrorText = ({data}) => {
  return (
    <div
      style={{
        color: data?.statusCode >= 400 ? 'red' : 'inherit',
      }}
    >
      {data?.statusCode >= 400 && Array.isArray(data?.message)
        ? data?.message[0]
        : data?.message}
    </div>
  );
};

export default ErrorText;
