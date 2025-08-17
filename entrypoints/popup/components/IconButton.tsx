export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: number;
};

const IconButton: React.FC<IconButtonProps> = ({ children }) => {
  return (
    <button className="bg-transparent border-none text-xl text-white cursor-pointer p-1 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/20">
      {children}
    </button>
  );
};

export default IconButton;
