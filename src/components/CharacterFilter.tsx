import React, { useMemo } from "react";
import { type Column, type Table } from "@tanstack/react-table";
import { DebounceInput } from "./DebounceInput";
import SimpleAutoComplete from './SimAutoComplete'

export const CharacterFilter = ({ column, table,combo=false }: { column: Column<any, unknown>; table: Table<any>,combo?:boolean }) => {
  return (
    <div>CharacterFilter</div>
  )
}
