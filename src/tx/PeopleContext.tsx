import React, { createContext } from "react";
import { useState, useMemo } from "react";
import { type Person } from "../config/types";
import {
  type GroupingState,
  type ColumnFiltersState,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import { containsFilter,daybiggerFilter, fuzzyFilter, fuzzySort, makeData } from "../config/methods";
import dayjs from 'dayjs'
//import 'dayjs/locale/zh-hk'
//dayjs.locale('zh-hk')

export interface PeopleContextProps {
  table: Table<Person>;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
  filterValue: string;
}

const PeopleContext = createContext<Partial<PeopleContextProps>>({});

export const PeopleTableProvider = ({ count = 100000, children }: { count: number; children: React.ReactNode }) => {
  const [personData, setPersonData] = useState(() => makeData(count));
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const personColumns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        cell: (info) => info.getValue(),
        /**
         * override the value used for row grouping
         * (otherwise, defaults to the value derived from accessorKey / accessorFn)
         */
        getGroupingValue: (row) => `${row.firstName} ${row.lastName}`,
        enableGrouping: false,
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        header: "Last Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "age",
        header: "Age",
        aggregatedCell: ({ getValue }) => Math.round(getValue<number>() * 100) / 100,
        aggregationFn: "median",
      },
      {
        accessorKey: "visits",
        header: "Visits",
        
        aggregationFn: "sum",
        // aggregatedCell: ({ getValue }) => getValue().toLocaleString(),
        enableGrouping: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        sortingFn: fuzzySort,
        filterFn: "fuzzy",
        enableGlobalFilter:false,
      },
      {
        accessorKey: 'since',
        header: 'Since',
        cell: ({getValue})=> dayjs(getValue<Date>()).format('DD/MM/YYYY'),
        aggregationFn: 'mean',
        aggregatedCell: ({getValue})=> dayjs(getValue<Date>()).format('DD/MM/YYYY'),
        getGroupingValue: row => `${dayjs(row.since).format('YYYYMM')}`,
        filterFn: daybiggerFilter,
        enableColumnFilter:true,
        enableGlobalFilter:false,
        
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        cell: ({ getValue }) => Math.round(getValue<number>() * 100) / 100 + "%",
        aggregationFn: "mean",
        aggregatedCell: ({ getValue }) => Math.round(getValue<number>() * 100) / 100 + "%",
        enableGrouping: false,
        
      },
    ],
    []
  );
  const personTable = useReactTable({
    data: personData,
    columns: personColumns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: { grouping, columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    onGroupingChange: setGrouping,
    globalFilterFn: containsFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <PeopleContext.Provider
      value={{
        table: personTable,
        filterValue: globalFilter,
        setFilterValue: setGlobalFilter,
      }}
    >
      {children}
    </PeopleContext.Provider>
  );
};

export default PeopleContext;
