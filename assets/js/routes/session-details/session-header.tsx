import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../../components/ui";
import { Session } from "../../schemas";

interface SessionHeaderProps {
  session: Session;
  isSessionOwner: boolean;
  isClosingSession: boolean;
  currentView: "manage" | "vote" | "results";
  onCloseSession?: () => void;
  onViewChange: (view: "manage" | "vote" | "results") => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  isSessionOwner,
  isClosingSession,
  currentView,
  onCloseSession,
  onViewChange,
}) => {
  const stateColors = {
    open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  };

  const stateLabels = {
    open: "Accepting Options",
    closed: "Voting Complete",
  };

  return (
    <div className="space-y-4">
      <Link
        to="/app"
        className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        ← Back to Sessions
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {session.name}
          </h1>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${stateColors[session.state]}`}
          >
            {stateLabels[session.state]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Close Session Button - only show for open sessions and session owner */}
          {session.state === "open" && isSessionOwner && onCloseSession && (
            <Button
              onClick={onCloseSession}
              disabled={isClosingSession}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              {isClosingSession ? "Closing..." : "Close Session"}
            </Button>
          )}

          {/* View Toggle - only show for open sessions */}
          {session.state === "open" && (
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => onViewChange("manage")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "manage"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Options
              </button>

              <button
                onClick={() => onViewChange("vote")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "vote"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Vote
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
