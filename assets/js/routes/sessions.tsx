import React from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { uuidv7 } from "uuidv7";

import { SessionsList, LoadingState, ErrorState } from "../components";
import { Session } from "../schemas";
import { getCurrentUserId } from "../util";

export const SessionsRoute = () => {
  const sessions: Session[] = [
    {
      id: "1",
      name: "Lunch Order",
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: getCurrentUserId(),
      state: "open",
    },
    {
      id: "2",
      name: "Family Dinner",
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: getCurrentUserId(),
      state: "closed",
    },
  ];
  const isLoading = false;
  const isError = false;
  const status = null;

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

  return <SessionsList sessions={sessions} />;
};
