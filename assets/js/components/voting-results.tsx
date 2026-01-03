import React from "react";
import { Card } from "./ui";
import { SessionOption, UserVote } from "../schemas";

interface VotingResultsProps {
  options: SessionOption[];
  votes: UserVote[];
}

interface OptionResult {
  option: SessionOption;
  totalPoints: number;
  voteCount: number;
  averageRank: number;
  rankDistribution: Record<number, number>;
}

export const VotingResults: React.FC<VotingResultsProps> = ({
  options,
  votes,
}) => {
  // Calculate results using a points system (1st choice = 5 points, 2nd = 4, etc.)
  const calculateResults = (): OptionResult[] => {
    const results: Record<string, OptionResult> = {};
    
    // Initialize results for all options
    options.forEach(option => {
      results[option.id] = {
        option,
        totalPoints: 0,
        voteCount: 0,
        averageRank: 0,
        rankDistribution: {},
      };
    });
    
    // Process all votes
    votes.forEach(userVote => {
      Object.entries(userVote.votes).forEach(([optionId, rank]) => {
        if (results[optionId]) {
          const points = Math.max(6 - rank, 1); // 1st = 5pts, 2nd = 4pts, etc., min 1pt
          results[optionId].totalPoints += points;
          results[optionId].voteCount += 1;
          results[optionId].rankDistribution[rank] = (results[optionId].rankDistribution[rank] || 0) + 1;
        }
      });
    });
    
    // Calculate average ranks
    Object.values(results).forEach(result => {
      if (result.voteCount > 0) {
        const totalRankSum = Object.entries(result.rankDistribution)
          .reduce((sum, [rank, count]) => sum + (parseInt(rank) * count), 0);
        result.averageRank = totalRankSum / result.voteCount;
      }
    });
    
    // Sort by total points (descending)
    return Object.values(results).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const results = calculateResults();
  const totalVoters = votes.length;

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

  if (totalVoters === 0) {
    return (
      <Card className="text-center py-12">
        <div className="space-y-3">
          <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            No votes yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Results will appear here once people start voting.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Voting Results
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Based on {totalVoters} vote{totalVoters !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => {
          const position = index + 1;
          const participationRate = totalVoters > 0 ? (result.voteCount / totalVoters) * 100 : 0;
          
          return (
            <Card key={result.option.id} className={`
              ${position <= 3 ? 'border-2' : 'border'}
              ${position <= 3 ? getRankColor(position).split(' ').filter(c => c.includes('border')).join(' ') : ''}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Position Badge */}
                  <div className={`
                    px-3 py-2 rounded-lg text-lg font-bold border-2 min-w-[60px] text-center
                    ${getRankColor(position)}
                  `}>
                    {getPositionIcon(position)}
                  </div>
                  
                  {/* Restaurant Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {result.option.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span>{result.totalPoints} points</span>
                      <span>•</span>
                      <span>{result.voteCount} vote{result.voteCount !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{participationRate.toFixed(0)}% participation</span>
                      {result.voteCount > 0 && (
                        <>
                          <span>•</span>
                          <span>Avg rank: {result.averageRank.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Vote Distribution */}
                {result.voteCount > 0 && (
                  <div className="flex gap-1">
                    {Object.entries(result.rankDistribution)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([rank, count]) => (
                        <div
                          key={rank}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300"
                          title={`${count} vote${count !== 1 ? 's' : ''} for ${rank}${rank === '1' ? 'st' : rank === '2' ? 'nd' : rank === '3' ? 'rd' : 'th'} choice`}
                        >
                          {rank}:{count}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};