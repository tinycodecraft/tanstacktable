import React, { useEffect, useState } from "react";
import { Input, InputProps } from "@material-tailwind/react";
import { useDebounce } from "usehooks-ts";


export const DebounceInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputProps, "onChange" | "ref">) => {
  const [value, setValue] = useState(initialValue);
  const debouncevalue = useDebounce(value);
  React.useEffect(() => {
    if(String(debouncevalue) === "0")
    {
      onChange("");
    }
    else{
      onChange(debouncevalue)
    }
    

  }, [debouncevalue])

  return <Input variant="outlined" value={value} onChange={(e)=> setValue(e.target.value)} {...props}></Input>;
};
