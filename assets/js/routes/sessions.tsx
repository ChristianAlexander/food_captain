import React from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { uuidv7 } from "uuidv7";

import { SessionsList, LoadingState, ErrorState } from "../components";
import { Session } from "../schemas";
import { getCurrentUserId } from "../util";
import { sessionsCollection } from "../collections";

export const SessionsRoute = () => {
  const {
    data: sessions,
    isLoading,
    isError,
    status,
  } = useLiveQuery((q) =>
    q
      .from({ session: sessionsCollection })
      .orderBy(({ session }) => session.inserted_at, "desc"),
  );

  const handleCreateSession = (name: string) => {
    sessionsCollection.insert({
      id: uuidv7(),
      name: name,
      state: "open",
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: getCurrentUserId(),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading your sessions..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load sessions"
        message={`Unable to load your voting sessions. ${status ? `Error: ${status}` : ""}`}
      />
    );
  }

  return (
    <SessionsList sessions={sessions} onCreateSession={handleCreateSession} />
  );
};
