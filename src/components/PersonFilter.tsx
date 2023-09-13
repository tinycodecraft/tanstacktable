import React, { useMemo } from "react";
import { type Column, type Table } from "@tanstack/react-table";
import { DebounceInput } from "./DebounceInput";

export const PersonFilter = ({ column, table }: { column: Column<any, unknown>; table: Table<any> }) => {
  const colvalue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const colfiltervalue = column.getFilterValue();

  
  const colsortvalues = useMemo(() => {
    return typeof colvalue === "number" ? [] : Array.from(column.getFacetedUniqueValues().keys()).sort();
  }, [column.getFacetedUniqueValues()]);

  return typeof colvalue !== "number" ? (
    <>
      <datalist id={column.id + "list"}>
        {colsortvalues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebounceInput
        type="text"
        value={String(colfiltervalue ?? "")}
        onChange={(curvalue) => column.setFilterValue(curvalue)}
        label={`${column.id}(${column.getFacetedUniqueValues().size})`}
        list={column.id + " list"}
      />
    </>
  ) : (
    <>
      <DebounceInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={Number((colfiltervalue as [number, number])?.[0] ?? "")}
        onChange={(curvalue)=> column.setFilterValue((old: [number,number])=> [curvalue,old?.[1]])}
        label={`Min ${column.getFacetedMinMaxValues()?.[0] ? (`(${column.getFacetedMinMaxValues()?.[0]})`): ''}`}
      />
      <DebounceInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={Number((colfiltervalue as [number, number])?.[1] ?? "")}
        onChange={(curvalue)=> column.setFilterValue((old: [number,number])=> [old?.[0],curvalue])}
        label={`Max ${column.getFacetedMinMaxValues()?.[1] ? (`(${column.getFacetedMinMaxValues()?.[1]})`): ''}`}
      />      
    </>
  );
};
