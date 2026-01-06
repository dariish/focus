import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

export default function SearchInput({
  placeholder,
  onChange,
}: {
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");

  function handleChange(value: string) {
    setSearch(value);
    onChange?.(value.trim());
  }
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none">
        <IoSearch className="text-stroke-600 group-focus-within:text-stroke-600 transition-colors duration-200" />
      </div>
      <input
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        type="search"
        id="search"
        className="block w-full py-1 ps-5.5 pe-4.5 border-b-2 border-transparent  focus:outline-none focus:border-stroke-500 max-w-[160px] focus:max-w-full  duration-700 placeholder:text-tertiary-400  font-light placeholder:text-sm"
        placeholder={placeholder}
        autoComplete="off"
      />
      {search.length > 0 && (
        <div
          className="cursor-pointer absolute inset-y-0 end-0 flex items-center ps-2"
          onClick={() => handleChange("")}
        >
          <IoIosClose className="w-6 h-6 text-stroke-600 hover:text-stroke-600 transition-colors duration-200" />
        </div>
      )}
    </div>
  );
}
