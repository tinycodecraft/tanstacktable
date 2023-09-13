import { FilterFn } from "@tanstack/react-table";
import { RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
    
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type CharacterType = {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
};

export type CharacterRowType = {
  isItemLoaded: (index: number) => boolean;
  items: CharacterType[];
};

export type PageInfoType = {
  count: number;
  pages: number;
  next: string;
  prev: string;
};

export type CharacterResultResponse = {
  results: CharacterType[];
  info: PageInfoType;
};

export type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: "relationship" | "complicated" | "single";
  subRows?: Person[];
};

export const FETCHSIZE = 20;
