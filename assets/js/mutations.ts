import { createTransaction } from "@tanstack/react-db";

import { optionsCollection, votesCollection } from "./collections";

export function createSessionOptionTransaction() {
  return createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      optionsCollection.utils.acceptMutations(transaction);
    },
  });
}

export function createSessionVoteTransaction() {
  return createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      votesCollection.utils.acceptMutations(transaction);
    },
  });
}
