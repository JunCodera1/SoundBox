import { Input } from "@chakra-ui/react";
import React from "react";

const TextInput = ({ label, placeholder, className, value, setValue }) => {
  return (
    <div className={`textInputDiv flex flex-col space-y-2 w-full ${className}`}>
      <label
        htmlFor={label}
        className="font-semibold text-base md:text-lg lg:text-xl"
      >
        {label}
      </label>
      <Input
        border={"1px"}
        type="text"
        placeholder={placeholder}
        className="p-2 md:p-3 border-3 bg-black border-gray-400 rounded w-full placeholder-gray-500 text-sm md:text-base lg:text-lg "
        id={label}
        value={value}
        required
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
