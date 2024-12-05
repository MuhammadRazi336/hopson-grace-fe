
import { Button, Typography } from "@material-tailwind/react";


export default function ButtonComponent({ text, onClick, disabled = false, className }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded ${disabled ? 'bg-gray-300' : 'bg-black text-white'} ${className}`}
    >
      <Typography>
        {text}
      </Typography>
    </Button>
  );
}
