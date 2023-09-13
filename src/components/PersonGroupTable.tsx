import { MagnifyingGlassIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, UserPlusIcon,UserMinusIcon } from "@heroicons/react/24/outline";

import PeopleContext from "../tx/PeopleContext";
import { Card, CardHeader, Input, Typography, Button, CardBody, Select, CardFooter, Tabs, TabsHeader, Tab, Option } from "@material-tailwind/react";
import { flexRender } from "@tanstack/react-table";
import { PersonFilter } from "./PersonFilter";

import React, { useContext, useState } from "react";
import { clsxm } from "../config/methods";
const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Relationship",
    value: "relationship",
  },
  {
    label: "Complicated",
    value: "complicated",
  },
  {
    label: "Single",
    value: "single",
  },
];
export const PersonGroupTable = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { table, filterValue, setFilterValue } = useContext(PeopleContext);
  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Members list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all members
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outlined" size="sm">
              view all
            </Button>
            <Button className="flex items-center gap-3" size="sm">
              <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add member
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Tabs value={activeTab} className="w-full md:w-max">
            <TabsHeader>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value} onClick={() => setActiveTab(value)}>
                  &nbsp;&nbsp;{label}&nbsp;&nbsp;
                </Tab>
              ))}
            </TabsHeader>
          </Tabs>
          <div className="w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={filterValue}
              onChange={(e) => setFilterValue && setFilterValue(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            {table &&
              table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="cursor-pointer border border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder ? null : (
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                            >
                                <button
                                  {...{
                                    onClick: header.column.getToggleGroupingHandler(),
                                    style: {
                                      cursor: "pointer",
                                    },
                                    disabled: !header.column.getCanGroup(),
                                  }}
                                >
                                  {header.column.getCanGroup() ? (header.column.getIsGrouped() ? (<UserMinusIcon strokeWidth={2} className="h-4 w-4" />) : (<UserPlusIcon   strokeWidth={2} className="h-4 w-4" />)) : null}
                                </button>
                              {flexRender(header.column.columnDef.header, header.getContext())}{" "}
                              <button
                                {...{
                                  disabled: !header.column.getCanSort(),
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {{
                                  asc: <ChevronUpIcon strokeWidth={2} className="h-4 w-4" />,
                                  desc: <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />,
                                }[String(header.column.getIsSorted()) ?? null] ?? <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />}
                              </button>
                            </Typography>
                            {header.column.getCanFilter() ? (<PersonFilter column={header.column} table={table}></PersonFilter>): null}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
          </thead>
          <tbody>
            {table &&
              table.getRowModel().rows.map((row, i) => {
                return (
                  <tr key={row.id} className={clsxm("even:bg-blue-gray-100/50")}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          {...{
                            key: cell.id,
                          }}
                        >
                          {cell.getIsGrouped() ? (
                            <div className="flex items-center gap-3">
                              <button
                                {...{
                                  onClick: row.getToggleExpandedHandler(),
                                  style: {
                                    cursor: row.getCanExpand() ? "pointer" : "normal",
                                  },
                                }}
                              >
                                {row.getIsExpanded() ? "👇" : "👉"}
                              </button>
                              <Typography variant="small" className="font-normal">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())} ({row.subRows.length})
                              </Typography>
                            </div>
                          ) : cell.getIsAggregated() ? (
                            // If the cell is aggregated, use the Aggregated
                            // renderer for cell
                            <Typography variant="small" className="font-normal opacity-70">
                              {flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())}
                            </Typography>
                          ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                            // Otherwise, just render the regular cell
                            <Typography variant="small" className="font-normal">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Typography>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Button
          variant="outlined"
          size="sm"
          onClick={() => table && table.setPageIndex(0)}
          disabled={!table || !table.getCanPreviousPage()}
          className="mr-1"
        >
          {"<<"}
        </Button>
        <Button variant="outlined" size="sm" onClick={() => table && table.previousPage()} disabled={!table || !table.getCanPreviousPage()}>
          {"<"}
        </Button>
        <Button variant="outlined" size="sm" onClick={() => table && table.nextPage()} disabled={!table || !table.getCanNextPage()} className="ml-1">
          {">"}
        </Button>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => table && table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table || !table.getCanNextPage()}
          className="ml-1"
        >
          {">>"}
        </Button>
        <Typography variant="small" color="blue-gray" className="font-normal w-[200px]">
          Page {table && table.getState().pagination.pageIndex + 1} of {table && table.getPageCount()}
        </Typography>
        <div className="w-72">
          <Input
            label="Go to Page"
            type="number"
            min={1}
            max={table?.getPageCount()}
            defaultValue={table && table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table && table.setPageIndex(page);
            }}
          />
        </div>
        <div className="w-72">
          <Select
            variant="outlined"
            label="Select Version"
            value={table && table.getState().pagination.pageSize.toString()}
            onChange={(value) => {
              if (value) table && table.setPageSize(Number(value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <Option key={pageSize} value={pageSize.toString()}>
                Show {pageSize}
              </Option>
            ))}
          </Select>
        </div>
        <div className="w-[100%]"></div>
      </CardFooter>
    </Card>
  );
};
