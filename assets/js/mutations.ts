import {
  createTransaction,
  TransactionWithMutations,
} from "@tanstack/react-db";

import { MatchingStrategy } from "@tanstack/electric-db-collection/dist/esm/electric";
import { getCSRFToken, relativeUrl } from "./util";

export function createApiInsertFn(resource: string) {
  return async ({
    transaction,
  }: {
    transaction: TransactionWithMutations;
  }): Promise<MatchingStrategy> => {
    let data: any = transaction.mutations[0].changes;
    if (transaction.mutations.length > 1) {
      data = transaction.mutations.map((mutation) => mutation.changes);
    }
    const response = await fetch(relativeUrl(`/api/${resource}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": getCSRFToken() ?? "",
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error("Failed to save");
    }
  };
}

export const createApiUpdateFn = (resource: string) => {
  return async ({
    transaction,
  }: {
    transaction: TransactionWithMutations;
  }): Promise<MatchingStrategy> => {
    const mutation = transaction.mutations[0];
    const response = await fetch(
      relativeUrl(`/api/${resource}/${mutation.key}`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken() ?? "",
        },
        body: JSON.stringify({ data: mutation.changes }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update");
    }
  };
};

export function createSessionOptionTransaction(sessionId: string) {
  return createTransaction({
    autoCommit: false,
    mutationFn: createApiInsertFn(`sessions/${sessionId}/options`),
  });
}
export function createSessionVoteTransaction(sessionId: string) {
  return createTransaction({
    autoCommit: false,
    mutationFn: async ({
      transaction,
    }: {
      transaction: TransactionWithMutations;
    }): Promise<MatchingStrategy> => {
      const csrfToken = getCSRFToken() ?? "";

      // Map mutations to serializable format expected by Phoenix.Sync.Writer.Format.TanstackDB
      const operations = transaction.mutations.map((mutation) => ({
        type: mutation.type,
        original: mutation.original || {},
        modified: mutation.modified || {},
        changes: mutation.changes || {},
        syncMetadata: {
          relation: "session_votes", // Table name as string for Phoenix.Sync.Writer
        },
      }));

      const url = relativeUrl(`/api/sessions/${sessionId}/votes`);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ operations }),
      });

      if (!response.ok) {
        const errorMessage = `Failed to update session votes`;
        throw new Error(
          `${errorMessage}: ${response.status} ${response.statusText}`,
        );
      }

      const { txid } = await response.json();
      return { txid };
    },
  });
}
