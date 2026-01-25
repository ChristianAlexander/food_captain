import { useCallback, useMemo, useRef } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { eq, type Transaction } from "@tanstack/db";

import {
  sessionOptionsCollection,
  sessionVotesCollection,
} from "../collections";
import { createSessionVoteTransaction } from "../mutations";
import { SessionVote } from "../schemas";

export function useVoting(sessionId: string) {
  const voteTransactionRef = useRef<Transaction | null>(null);

  const getVoteTransaction = () => {
    if (!voteTransactionRef.current) {
      voteTransactionRef.current = createSessionVoteTransaction(sessionId);
    }
    return voteTransactionRef.current;
  };
  const optionsCollection = useMemo(
    () => sessionOptionsCollection(sessionId),
    [sessionId],
  );
  const votesCollection = useMemo(
    () => sessionVotesCollection(sessionId),
    [sessionId],
  );

  const { data: options, isLoading: isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ option: optionsCollection })
        .leftJoin({ vote: votesCollection }, ({ option, vote }) =>
          eq(option.id, vote.option_id),
        )
        .orderBy(({ vote }) => vote?.rank),
    [optionsCollection],
  );

  const rankedOptions = options.filter(
    (item): item is typeof item & { vote: NonNullable<SessionVote> } =>
      !!item.vote,
  );
  const availableOptions = options
    .filter((item) => !item.vote)
    .map((item) => item.option);

  const addOption = useCallback(
    async (optionId: string) => {
      const newRank = rankedOptions.length + 1;
      const tx = getVoteTransaction();

      tx.mutate(() => {
        votesCollection.insert({
          id: `vote-${sessionId}-${optionId}`,
          session_id: sessionId,
          rank: newRank,
          option_id: optionId,
        });
      });
    },
    [sessionId, rankedOptions.length, votesCollection],
  );

  const moveUp = useCallback(
    (optionId: string) => {
      const index = rankedOptions.findIndex((r) => r.option.id === optionId);
      if (index <= 0) return;

      const current = rankedOptions[index];
      const above = rankedOptions[index - 1];
      const tx = getVoteTransaction();

      tx.mutate(() => {
        votesCollection.update(current.vote.id, (v) => {
          v.rank = above.vote.rank;
        });
        votesCollection.update(above.vote.id, (v) => {
          v.rank = current.vote.rank;
        });
      });
    },
    [rankedOptions, votesCollection],
  );

  const moveDown = useCallback(
    (optionId: string) => {
      const index = rankedOptions.findIndex((r) => r.option.id === optionId);
      if (index === -1 || index >= rankedOptions.length - 1) return;

      const current = rankedOptions[index];
      const below = rankedOptions[index + 1];
      const tx = getVoteTransaction();

      tx.mutate(() => {
        votesCollection.update(current.vote.id, (v) => {
          v.rank = below.vote.rank;
        });
        votesCollection.update(below.vote.id, (v) => {
          v.rank = current.vote.rank;
        });
      });
    },
    [rankedOptions, votesCollection],
  );

  const removeOption = useCallback(
    async (optionId: string) => {
      const index = rankedOptions.findIndex((r) => r.option.id === optionId);
      if (index === -1) return;

      const removedItem = rankedOptions[index];
      const itemsAfter = rankedOptions.slice(index + 1);
      const tx = getVoteTransaction();

      tx.mutate(() => {
        votesCollection.delete(removedItem.vote.id);

        for (const item of itemsAfter) {
          votesCollection.update(item.vote.id, (v) => {
            v.rank -= 1;
          });
        }
      });
    },
    [rankedOptions, votesCollection],
  );

  const clearVotes = useCallback(async () => {
    const tx = getVoteTransaction();

    tx.mutate(() => {
      rankedOptions.forEach((item) => {
        votesCollection.delete(item.vote.id);
      });
    });
    voteTransactionRef.current = null;
    await tx.commit();
  }, [rankedOptions, votesCollection]);

  const submitVotes = async () => {
    const tx = getVoteTransaction();
    voteTransactionRef.current = null;
    await tx.commit();
  };

  return {
    // Options
    rankedOptions,
    availableOptions,

    // Loading states
    isLoading,

    // Actions
    addOption,
    removeOption,
    moveUp,
    moveDown,
    clearVotes,
    submitVotes,
  };
}
