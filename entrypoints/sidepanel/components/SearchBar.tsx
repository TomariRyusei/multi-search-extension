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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [localValue, setLocalValue] = useState(keyword);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 親からkeywordが更新されたら同期
  useEffect(() => {
    setLocalValue(keyword);
  }, [keyword]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (count.total > 0) {
        onNext(id);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value); // ローカル更新 → 入力欄には即出る

    if (!isComposing) {
      onChange(id, value); // 半角/確定済みは即反映
    }
  };

  return (
    <div
      className="flex items-center mb-2.5 bg-[#2b2b2b] text-white rounded-lg px-2 py-3 h-11 border-2"
      style={{ borderColor: color }}
    >
      <input
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          const value = e.currentTarget.value;
          setIsComposing(false);
          onChange(id, value);
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none outline-none text-white text-sm"
        autoComplete="off"
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
