import React, { useMemo, useState } from "react";
import { type Column, type Table } from "@tanstack/react-table";
import { DebounceInput } from "./DebounceInput";
import SimpleAutoComplete from "./SimAutoComplete";
import { Select, Option } from "@material-tailwind/react";
import { SimDatePicker } from "./SimDatePicker";

export const PersonFilter = ({ column, table, combo = false }: { column: Column<any, unknown>; table: Table<any>; combo?: boolean }) => {
  const colvalue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const colfiltervalue = column.getFilterValue();
  
  

  const colsortvalues = useMemo(() => {
    return typeof colvalue === "number" ? [] : Array.from(column.getFacetedUniqueValues().keys()).sort();
  }, [column.getFacetedUniqueValues()]);

  return typeof colvalue !== "number" ? (
    combo ? (
      <div className="mt-1">
        <Select
          value={String(colfiltervalue ?? "")}
          label={`${column.columnDef.header}(${column.getFacetedUniqueValues().size})`}
          onChange={(curvalue) => {
            
            column.setFilterValue(curvalue);

          }}
        >
          
          {["",...colsortvalues].map((e) => {
            return (
              <Option value={e} key={e}>
                {e==="" ? "(Any)": e}
              </Option>
            );
          })}
        </Select>
      </div>
    ) : (typeof colvalue !=='string' ? 
    (<SimDatePicker label={`${column.columnDef.header}`} onChange={(value)=> value ? column.setFilterValue(value) : column.setFilterValue('')} />  
    ):(
      <SimpleAutoComplete
        onChange={(curvalue) => column.setFilterValue(curvalue)}
        value={String(colfiltervalue ?? "")}
        options={colsortvalues}
        placeholder={`${column.columnDef.header}(${column.getFacetedUniqueValues().size})`}
        className="mt-1"
      />
    )
    )
  ) : (
    <div className="flex items-center justify-between gap-2 font-normal leading-none opacity-70 mt-2">
      <DebounceInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={Number((colfiltervalue as [number, number])?.[0] ?? "")}
        onChange={(curvalue) => column.setFilterValue((old: [number, number]) => [curvalue, old?.[1]])}
        label={`Min ${column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ""}`}
      />
      <DebounceInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={Number((colfiltervalue as [number, number])?.[1] ?? "")}
        onChange={(curvalue) => column.setFilterValue((old: [number, number]) => [old?.[0], curvalue])}
        label={`Max ${column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ""}`}
      />
    </div>
  );
};
