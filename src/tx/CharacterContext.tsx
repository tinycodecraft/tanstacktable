import React, { createContext, useState, useMemo } from "react";
import { useInfiniteQuery, FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";
import { CharacterResultResponse, CharacterType } from "../config/types";
import { type ColumnFiltersState, useReactTable, getCoreRowModel, type ColumnDef, type Table, SortingState } from "@tanstack/react-table";
import { fuzzyFilter } from "../config/methods";

export interface CharacterContextProps {
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  flatData: CharacterType[];
  totalDBRowCount: number;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<CharacterResultResponse, unknown>>;
  table: Table<CharacterType>;
  columnFilters: ColumnFiltersState;
  changeColFilters: (filter: ColumnFiltersState) => void;
  globalFilter: string;
  changeGbFilter: (filter: string) => void;
  sorting: SortingState;
  changeSorting: (sort: SortingState) => void;
}
const CharacterContext = createContext<Partial<CharacterContextProps>>({});
export const CharacterProvider = ({ children, debug = false }: { children: React.ReactNode; debug?: boolean }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { data, fetchNextPage, isError, isFetching, isLoading } = useInfiniteQuery<CharacterResultResponse>({
    queryKey: ["character-table", columnFilters, globalFilter, sorting],
    queryFn: async ({ pageParam = 0, queryKey }) => {
      
      const url = new URL(`/api/character/?page=${pageParam}`, "https://rickandmortyapi.com");

      const response = await fetch(url.href);
      const json = (await response.json()) as CharacterResultResponse;
      

      return json;
    },
    getNextPageParam: (_lastgroup, groups) => {
      // the groups length reflect the cached pages
      // the _lastgroup is url return object with number of pages for the query , next, prev url plus total record count
      if (groups.length < _lastgroup.info.pages) return groups.length + 1;
      return null;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
  const flatData = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);
  const totalDBRowCount = useMemo(()=> data?.pages?.[0]?.info?.count ?? 0,[data]);
  
  const columns = useMemo<ColumnDef<CharacterType>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "species",
        header: "Species",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: (info) => info.getValue(),
      },
    ];
  }, []);
  const table = useReactTable({
    data: flatData,
    columns,
    state: { columnFilters, globalFilter, sorting },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CharacterContext.Provider
      value={{
        table,
        flatData,
        isFetching,
        isError,
        isLoading,
        fetchNextPage,
        columnFilters,
        globalFilter,
        changeColFilters: setColumnFilters,
        changeGbFilter: setGlobalFilter,
        sorting,
        changeSorting: setSorting,
        totalDBRowCount,
      }}
    ></CharacterContext.Provider>
  );
};

export default CharacterContext;