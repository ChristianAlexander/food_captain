import React, { useState, useEffect } from "react";
import { Card, LoadingState, ErrorState } from "./";

interface RankedChoiceResultsProps {
  sessionId: string;
}

interface RoundResult {
  round: number;
  vote_counts: Record<string, number>;
  total_votes: number;
  majority_threshold: number;
  eliminated?: {
    eliminated_options: Array<{
      option_id: string;
      option_name: string;
    }>;
    tied_for_last: boolean;
  };
  winner?: {
    option_id?: string;
    option_name?: string;
    vote_count?: number;
    tied_winners?: Array<{
      option_id: string;
      option_name: string;
      vote_count: number;
    }>;
  };
}

interface RankedChoiceData {
  session_id: string;
  session_name: string;
  total_voters: number;
  total_options: number;
  options: Record<string, string>;
  rounds: RoundResult[];
  winner?: {
    option_id?: string;
    option_name?: string;
    vote_count?: number;
    tied_winners?: Array<{
      option_id: string;
      option_name: string;
      vote_count: number;
    }>;
  };
}

export const RankedChoiceResults: React.FC<RankedChoiceResultsProps> = ({
  sessionId,
}) => {
  const [results, setResults] = useState<RankedChoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/sessions/${sessionId}/results`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  if (isLoading) {
    return <LoadingState message="Loading voting results..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load results"
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    );
  }

  if (!results) {
    return (
      <Card className="text-center py-12">
        <div className="space-y-3">
          <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            No results available
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Results will appear here once voting is complete.
          </p>
        </div>
      </Card>
    );
  }

  const getVotePercentage = (count: number, total: number) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700";
      case 3: return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700";
      default: return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${position}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Winner Section */}
      {results.winner && (
        <Card className="border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <div>
              {results.winner.tied_winners ? (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Tie for First Place!
                  </h2>
                  <div className="space-y-2">
                    {results.winner.tied_winners.map((winner, index) => (
                      <p key={winner.option_id} className="text-lg text-slate-600 dark:text-slate-400">
                        {winner.option_name}: {winner.vote_count} votes ({getVotePercentage(winner.vote_count, results.total_voters)}%)
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Winner: {results.winner.option_name}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {results.winner.vote_count} votes ({getVotePercentage(results.winner.vote_count!, results.total_voters)}%)
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {results.total_voters}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Voters
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {results.total_options}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Restaurant Options
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {results.rounds.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Voting Rounds
            </div>
          </div>
        </Card>
      </div>

      {/* Rounds Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Round-by-Round Results
        </h3>
        
        {results.rounds.map((round, index) => (
          <Card key={round.round} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Round {round.round}
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {round.total_votes} votes • Need {round.majority_threshold} for majority
              </div>
            </div>
            
            {/* Vote counts for this round */}
            <div className="space-y-2">
              {(() => {
                // Sort by vote count (descending) and group by count to handle ties
                const sortedEntries = Object.entries(round.vote_counts)
                  .sort(([, a], [, b]) => b - a);
                
                // Calculate ranks considering ties
                const entriesWithRanks: Array<{ optionId: string; count: number; rank: number }> = [];
                let currentRank = 1;
                let previousCount: number | null = null;
                
                sortedEntries.forEach(([optionId, count], idx) => {
                  if (previousCount !== null && count < previousCount) {
                    currentRank = idx + 1;
                  }
                  entriesWithRanks.push({ optionId, count, rank: currentRank });
                  previousCount = count;
                });
                
                return entriesWithRanks.map(({ optionId, count, rank }) => {
                  const optionName = results.options[optionId];
                  const percentage = getVotePercentage(count, round.total_votes);
                  const isWinner = round.winner?.option_id === optionId || 
                    round.winner?.tied_winners?.some(w => w.option_id === optionId);
                  const isEliminated = round.eliminated?.eliminated_options?.some(opt => opt.option_id === optionId);
                  
                  return (
                    <div
                      key={optionId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isWinner 
                          ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                          : isEliminated
                          ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
                          : "bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          px-2 py-1 rounded text-sm font-medium
                          ${getRankColor(rank)}
                        `}>
                          {getPositionIcon(rank)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {optionName}
                        </span>
                        {isWinner && (
                          <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                            {round.winner?.tied_winners ? "TIE" : "WINNER"}
                          </span>
                        )}
                        {isEliminated && (
                          <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">
                            ELIMINATED
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {count} votes
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Round outcome */}
            {round.winner ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    {round.winner.tied_winners ? (
                      <>
                        Tie between {round.winner.tied_winners.map(w => w.option_name).join(" and ")} 
                        ({round.winner.tied_winners[0].vote_count} votes each, {getVotePercentage(round.winner.tied_winners[0].vote_count, round.total_votes)}% each)
                      </>
                    ) : (
                      <>
                        {round.winner.option_name} wins with {round.winner.vote_count} votes 
                        ({getVotePercentage(round.winner.vote_count!, round.total_votes)}%)
                      </>
                    )}
                  </span>
                </div>
              </div>
            ) : round.eliminated && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    {round.eliminated.tied_for_last ? (
                      <>
                        {round.eliminated.eliminated_options.length} options eliminated (tied for fewest votes): {' '}
                        {round.eliminated.eliminated_options.map(opt => opt.option_name).join(", ")}
                      </>
                    ) : (
                      <>
                        {round.eliminated.eliminated_options[0]?.option_name} eliminated (fewest votes)
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};