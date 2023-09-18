import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { range } from "../config/methods";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.module.css";
import { useDebounce } from "usehooks-ts";
import { ArrowLongLeftIcon, ArrowLongRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

//import {registerLocale, setDefaultLocale} from 'react-datepicker'
//import hk from 'date-fns/locale/zh-HK'
//registerLocale('hk',hk)

export const SimDatePicker = ({
  fromYear,
  toYear,
  defaultDate = null,
  onChange,
  label,
}: {
  fromYear?: number;
  toYear?: number;
  defaultDate?: Date | null;
  onChange: (value: Date | null) => void;
  label: string;
}) => {
  const myfromYear = fromYear ?? 1990;
  const mytoYear = toYear ?? 2999;

  const [dateValue, setDateValue] = useState<Date | null>(defaultDate);
  const debouncedValue = useDebounce(dateValue);
  const years = range(myfromYear, mytoYear - myfromYear);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const changeHandler = (val: Date | null) => {
    setDateValue(val);
  };
  useEffect(() => {
    if (onChange) onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <DatePicker
      placeholderText={label}
      showIcon
      isClearable
      renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div
          style={{
            margin: 10,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
            <ArrowLongLeftIcon strokeWidth={2} className="w-4 h-4 mr-2" />
          </button>
          <select value={Number(dayjs(date).format("YYYY"))} onChange={({ target: { value } }) => changeYear(Number(value))}>
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select value={dayjs(date).format("MMMM")} onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}>
            {months.map((option, i) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            <ArrowLongRightIcon strokeWidth={2} className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
      selected={dateValue}
      onChange={changeHandler}
      dateFormat="dd/MM/yyyy"
    />
  );
};
