import { CHAIN_NAMES } from "./blockExplorer";

export const chains = Object.entries(CHAIN_NAMES).map(([id, name]) => ({
  id,
  name,
}));
  