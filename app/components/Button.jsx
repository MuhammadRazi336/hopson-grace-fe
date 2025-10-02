import {Button, Typography} from '@material-tailwind/react';
import { Link } from '@remix-run/react';

export default function ButtonComponent({
  text,
  onClick,
  type = 'button',
  disabled = false,
  className,
  // link,
  ...rest
}) {
  return (
    // <Link to={link}>
    <Button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`px-6 py-2 rounded bastardogrotesk ${
        disabled ? 'bg-gray-300' : 'bg-black text-white'
      } ${className}`}
      {...rest}
    >
      <Typography className='text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw]'>{text}</Typography>
    </Button>
    // </Link>
  );
}
