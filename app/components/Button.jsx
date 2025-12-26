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
      className={`px-[5px] py-2 rounded bastardogrotesk cursor-pointer ${
        disabled ? 'bg-gray-300' : 'bg-black text-white'
      } ${className}`}
      {...rest}
    >
      <Typography className='text-[10px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw]'>{text}</Typography>
    </Button>
    // </Link>
  );
}
