import {Button, Typography} from '@material-tailwind/react';

export default function ButtonComponent({
  text,
  onClick,
  disabled = false,
  className,
  type,
  ...rest
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`px-6 py-2 rounded ${
        disabled ? 'bg-gray-300' : 'bg-black text-white'
      } ${className}`}
      {...rest}
    >
      <Typography>{text}</Typography>
    </Button>
  );
}
