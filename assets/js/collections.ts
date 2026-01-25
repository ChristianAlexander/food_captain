import {
  createCollection,
  localStorageCollectionOptions,
  TransactionWithMutations,
} from "@tanstack/react-db";

import {
  SessionOptionSchema,
  SessionSchema,
  SessionVoteSchema,
} from "./schemas";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { getCSRFToken, relativeUrl } from "./util";
import { MatchingStrategy } from "@tanstack/electric-db-collection/dist/esm/electric";

const parser: any = {
  int8: (value: string) => parseInt(value, 10),
  timestamp: (value: string) => new Date(value + "Z").toISOString(), // Treat PostgreSQL timestamps as UTC
};

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

export const sessionsCollection = createCollection(
  electricCollectionOptions({
    shapeOptions: {
      url: relativeUrl("/api/shapes/sessions"),
      parser,
    },
    getKey: (session) => session.id,
    schema: SessionSchema,
    onInsert: createApiInsertFn("sessions"),
  }),
);

export const singleSessionCollection = (id: string) =>
  createCollection(
    electricCollectionOptions({
      shapeOptions: {
        url: relativeUrl(`/api/shapes/sessions/${id}`),
        parser,
      },
      getKey: (session: any) => session.id,
      schema: SessionSchema,
      onUpdate: createApiUpdateFn(`sessions`),
    }),
  );

export const sessionOptionsCollection = (id: string) =>
  createCollection(
    electricCollectionOptions({
      shapeOptions: {
        url: relativeUrl(`/api/shapes/sessions/${id}/options`),
        parser,
      },
      getKey: (option: any) => option.id,
      schema: SessionOptionSchema,
      onInsert: createApiInsertFn(`sessions/${id}/options`),
      onUpdate: createApiUpdateFn(`sessions/${id}/options`),
    }),
  );

export const sessionVotesCollection = (sessionId: string) =>
  createCollection(
    electricCollectionOptions({
      shapeOptions: {
        url: relativeUrl(`/api/shapes/sessions/${sessionId}/my-votes`),
        parser,
      },
      getKey: (vote: any) => vote.id,
      schema: SessionVoteSchema,
    }),
  );
