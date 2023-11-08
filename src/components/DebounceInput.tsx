import React, { useEffect, useState } from "react";
import { Input, InputProps } from "@material-tailwind/react";
import { useDebouncedState } from '@mantine/hooks';


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
  const [value,setValue] = useDebouncedState('',debounce);

  return <Input variant="outlined" value={value} onChange={(e)=> setValue(e.target.value)} {...props}></Input>;
};
