import { MdOutlineKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import IconButton from "./IconButton";

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
      className="flex items-center mb-2.5 bg-[#2b2b2b] text-white rounded-lg px-2 py-3 h-11 border-2"
      style={{ borderColor: color }}
    >
      <input
        value={keyword}
        onChange={(e) => onChange(id, e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-white text-sm"
      />
      <span className="mx-2 text-sm whitespace-nowrap font-bold">
        {count.current} / {count.total}
      </span>
      <IconButton onClick={() => onPrev(id)}>
        <MdOutlineKeyboardArrowUp />
      </IconButton>
      <IconButton onClick={() => onNext(id)}>
        <MdOutlineKeyboardArrowDown />
      </IconButton>
      <IconButton onClick={() => onClear(id)}>
        <IoIosClose />
      </IconButton>
    </div>
  );
};

export default SearchBar;
