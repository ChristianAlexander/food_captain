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
import { relativeUrl } from "./util";
import { createApiInsertFn, createApiUpdateFn } from "./mutations";

const parser: any = {
  int8: (value: string) => parseInt(value, 10),
  timestamp: (value: string) => new Date(value + "Z").toISOString(), // Treat PostgreSQL timestamps as UTC
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
