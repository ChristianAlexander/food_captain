import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { eq, useLiveQuery } from "@tanstack/react-db";

import {
  LoadingState,
  ErrorState,
  RankedChoiceResults,
} from "../../components";
import { getCurrentUserId } from "../../util";
import { Session } from "../../schemas";
import { OptionsManagement } from "./options-management";
import { SessionHeader } from "./session-header";
import { VotingInterface } from "./voting-interface";

export const SessionDetailsRoute = () => {
  const { sessionId } = useParams({ from: "/app/sessions/$sessionId" });
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"manage" | "vote">("manage");
  const [isClosingSession, setIsClosingSession] = useState(false);

  const currentUserId = getCurrentUserId();
  const session = null as Session | null;
  const isSessionLoading = false;
  const isSessionError = false;
  const sessionStatus = null;

  if (isSessionLoading) {
    return <LoadingState message="Loading session details..." />;
  }

  if (isSessionError) {
    const errorMessage = `Failed to load session. ${sessionStatus ? `Error: ${sessionStatus}` : ""}`;

    return <ErrorState title="Failed to load session" message={errorMessage} />;
  }

  if (!session) {
    return (
      <ErrorState
        title="Session not found"
        message="The session you're looking for doesn't exist or has been deleted."
        onRetry={() => navigate({ to: "/app" })}
        retryLabel="Go Back to Sessions"
      />
    );
  }

  const isSessionOwner = session?.user_id === currentUserId;

  return (
    <div className="space-y-8">
      <SessionHeader
        session={session}
        isSessionOwner={isSessionOwner}
        isClosingSession={isClosingSession}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {session.state === "closed" ? (
        <RankedChoiceResults sessionId={sessionId} />
      ) : (
        <>
          {currentView === "manage" ? (
            <OptionsManagement sessionId={sessionId} />
          ) : (
            <VotingInterface sessionId={sessionId} />
          )}
        </>
      )}
    </div>
  );
};
