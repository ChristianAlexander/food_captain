import { SessionOption, SessionVote } from "../schemas";

const asyncNoOp = async () => {};

export function useVoting(sessionId: string) {
  return {
    // Options
    rankedOptions: [] as { option: SessionOption; vote: SessionVote }[],
    availableOptions: [] as SessionOption[],

    // Loading states
    isLoading: false,

    // Actions
    addOption: asyncNoOp,
    removeOption: asyncNoOp,
    moveUp: asyncNoOp,
    moveDown: asyncNoOp,
    clearVotes: asyncNoOp,
    submitVotes: asyncNoOp,
  };
}
