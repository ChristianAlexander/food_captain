import React, { useState } from "react";

import { Button, Card, VotingCard, useToast } from "../../components";
import { useVoting } from "../../hooks/voting";

interface VotingInterfaceProps {
  sessionId: string;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  sessionId,
}) => {
  const {
    rankedOptions,
    availableOptions,
    isLoading,
    addOption,
    removeOption,
    moveUp,
    moveDown,
    clearVotes,
    submitVotes,
  } = useVoting(sessionId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmitVotes = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitVotes();

      addToast("Your votes have been submitted!", "success");
    } catch (error) {
      console.error("Failed to submit votes:", error);
      addToast("Failed to submit votes. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="text-center py-12">
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400">
            Loading voting options...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Vote for Your Favorite Restaurants
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select restaurants in order of preference. Use the arrow buttons to
          reorder your choices.
        </p>
      </div>

      {rankedOptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your Choices ({rankedOptions.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearVotes}
              className="text-slate-600 dark:text-slate-400"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
            {rankedOptions.map(({ option, vote }, index) => (
              <VotingCard
                key={option.id}
                option={option}
                rank={vote.rank}
                isSelected={true}
                onSelect={addOption}
                onRemove={removeOption}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                canMoveUp={index > 0}
                canMoveDown={index < rankedOptions.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {availableOptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Available Restaurants ({availableOptions.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {availableOptions.map((option) => (
              <VotingCard
                key={option.id}
                option={option}
                isSelected={false}
                onSelect={addOption}
                onRemove={removeOption}
              />
            ))}
          </div>
        </div>
      )}

      {rankedOptions.length > 0 && (
        <div className="flex justify-center pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearVotes}>
              Start Over
            </Button>
            <Button
              onClick={handleSubmitVotes}
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting
                ? "Submitting..."
                : `Submit My Votes (${rankedOptions.length} choice${rankedOptions.length !== 1 ? "s" : ""})`}
            </Button>
          </div>
        </div>
      )}

      {!isLoading &&
        rankedOptions.length === 0 &&
        availableOptions.length === 0 && (
          <Card className="text-center py-12">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                No restaurants to vote on yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Ask the session organizer to add some restaurant options first.
              </p>
            </div>
          </Card>
        )}
    </div>
  );
};
