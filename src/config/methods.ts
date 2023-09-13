import { type Person } from "./types";
import { faker } from "@faker-js/faker";

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FilterFn, SortingFn, sortingFns } from "@tanstack/react-table";
import { compareItems, rankItem, rankings } from "@tanstack/match-sorter-utils";

const clsxm = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export const FETCHSIZE = 20;

const containsFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(
    String(row.getValue(columnId) ?? "")
      .toLowerCase()
      .trim(),
    String(value ?? "").toLowerCase().trim(),
    { threshold: rankings.CONTAINS }
  );

  addMeta({ itemRank });

  return itemRank.passed;
};
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item where value is the filter value
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId]?.itemRank!, rowB.columnFiltersMeta[columnId]?.itemRank!);
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (): Person => {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.datatype.number(40),
    visits: faker.datatype.number(1000),
    progress: faker.datatype.number(100),
    status: faker.helpers.shuffle<Person["status"]>(["relationship", "complicated", "single"])[0]!,
  };
};

const makeData = (...lens: number[]) => {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((d): Person => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
};

export { range, newPerson, makeData, clsxm, fuzzyFilter, fuzzySort, containsFilter };
