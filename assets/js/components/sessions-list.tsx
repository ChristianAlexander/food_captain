import React, { useState } from "react";
import { Session } from "../schemas";
import { SessionCard } from "./session-card";
import { Button, Modal, Input } from "./ui";

interface SessionsListProps {
  sessions: Session[];
  onCreateSession?: (name: string) => void;
  isCreating?: boolean;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onCreateSession,
  isCreating = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateSession) return;

    // Validate session name
    const trimmedName = sessionName.trim();
    if (!trimmedName) {
      setNameError("Session name is required");
      return;
    }

    setNameError("");

    try {
      onCreateSession(trimmedName);
      // Reset form and close modal on success
      setSessionName("");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      setNameError("Failed to create session. Please try again.");
    }
  };

  const openCreateModal =
    onCreateSession &&
    (() => {
      setSessionName("");
      setNameError("");
      setIsCreateModalOpen(true);
    });

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSessionName("");
    setNameError("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Your Voting Sessions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Create sessions to gather restaurant options and let your crew vote
          </p>
        </div>
        {openCreateModal && (
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Create New Session
          </Button>
        )}
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <EmptyState onCreateSession={openCreateModal} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Voting Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-6">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Give your session a memorable name to help your crew identify it
            </p>
          </div>

          <Input
            label="Session Name"
            value={sessionName}
            onChange={setSessionName}
            placeholder="e.g., Friday Team Lunch, Weekend Dinner Plans, Birthday Celebration"
            error={nameError}
            required
            autoFocus
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? "Creating Session..." : "Create Session"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateModal}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Simple empty state
const EmptyState: React.FC<{ onCreateSession?: () => void }> = ({
  onCreateSession,
}) => (
  <div className="text-center py-16">
    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Ready to Set Sail?
    </h3>
    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
      No voting sessions yet, Captain! Create your first session to start
      gathering restaurant options and let your crew vote on where to eat.
    </p>
    {onCreateSession && (
      <Button onClick={onCreateSession}>Create Your First Session</Button>
    )}
  </div>
);
