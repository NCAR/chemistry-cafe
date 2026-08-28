import { Family } from "../../types/chemistryModels";

export type ViewProps = {
  family: Family;
  updateFamily: (family: Family) => void;
};
