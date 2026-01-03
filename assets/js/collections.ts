import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";

import {
  SessionOptionSchema,
  SessionSchema,
  SessionVoteSchema,
} from "./schemas";

export const sessionsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "sessions",
    getKey: (session) => session.id,
    schema: SessionSchema,
  }),
);

export const optionsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "sessionOptions",
    getKey: (vote) => vote.id,
    schema: SessionOptionSchema,
  }),
);

export const votesCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "votes",
    getKey: (vote) => vote.id,
    schema: SessionVoteSchema,
  }),
);
