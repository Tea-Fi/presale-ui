import { Currency } from "../app/utils/constants";

export type ProjectInfoOption = {
  title: string;
  description: string;
  link: string;
  max: number;
  value: number;
};

export type InvestmentInfoOption = {
  id: number;
  tge: string;
  vested: string;
  address?: Currency;
};
