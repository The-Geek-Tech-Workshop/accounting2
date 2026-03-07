import { Account } from "./types";

export const Accounts = {
  TransactionFees: {
    name: "Transaction Fees",
    type: "Expense",
  } as Account,
  ListingFees: {
    name: "Listing Fees",
    type: "Expense",
  } as Account,
  Sales: {
    name: "Sales",
    type: "Revenue",
  } as Account,
  OutwardShipping: {
    name: "Outward Shipping",
    type: "Expense",
  } as Account,

  Etsy: {
    name: "Etsy",
    type: "Asset",
  } as Account,

  EtsyClearing: {
    name: "Etsy Clearing",
    type: "Asset",
  } as Account,
};
