import { MdOutlineKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import IconButton from "./IconButton/IconButton";

export type SearchBarProps = {
  id: number;
  keyword: string;
  color: string;
  count: { current: number; total: number };
  onChange: (id: number, value: string) => void;
  onNext: (id: number) => void;
  onPrev: (id: number) => void;
  onClear: (id: number) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ id, keyword, color, count, onChange, onNext, onPrev, onClear }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
        background: "#2b2b2b",
        color: "white",
        borderRadius: "8px",
        padding: "4px 8px",
        height: "32px",
        border: `2px solid ${color}`,
      }}
    >
      <input
        value={keyword}
        onChange={(e) => onChange(id, e.target.value)}
        style={{
          flex: 1,
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          color: "white",
          fontSize: "13px",
        }}
      />
      <span style={{ margin: "0 8px", fontSize: "13px", whiteSpace: "nowrap", fontWeight: "bold" }}>
        {count.current} / {count.total}
      </span>
      <IconButton onClick={() => onPrev(id)}>
        <MdOutlineKeyboardArrowUp />
      </IconButton>
      <IconButton onClick={() => onNext(id)}>
        <MdOutlineKeyboardArrowDown />
      </IconButton>
      <IconButton size={20} onClick={() => onClear(id)}>
        <IoIosClose />
      </IconButton>
    </div>
  );
};

export default SearchBar;
