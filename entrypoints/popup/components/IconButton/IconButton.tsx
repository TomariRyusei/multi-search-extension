import "./IconButton.css";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: number;
};

const IconButton: React.FC<IconButtonProps> = ({ children, size = 16, ...props }) => {
  return (
    <button className="iconButton" style={{ fontSize: `${size}px` }} {...props}>
      {children}
    </button>
  );
};

export default IconButton;
