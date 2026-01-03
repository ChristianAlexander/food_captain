import React from "react";
import { Card } from "./ui";
import { SessionOption } from "../schemas";

interface VotingCardProps {
  option: SessionOption;
  rank?: number;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  onRemove: (optionId: string) => void;
  onMoveUp?: (optionId: string) => void;
  onMoveDown?: (optionId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  option,
  rank,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}) => {

  const getRankDisplay = (rank: number) => {
    const suffixes = ['st', 'nd', 'rd'];
    const suffix = suffixes[rank - 1] || 'th';
    return `${rank}${suffix}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700";
      case 3: return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700";
      default: return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
    }
  };

  if (isSelected) {
    return (
      <Card 
        className={`
          relative transition-all duration-200 shadow-md
          ${rank ? 'border-2' : 'border'}
          ${rank ? getRankColor(rank).split(' ').filter(c => c.includes('border')).join(' ') : ''}
        `}
      >
          <div 
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Up/Down Buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveUp?.(option.id)}
                  disabled={!canMoveUp}
                  className={`
                    p-1 rounded text-xs transition-colors
                    ${canMoveUp 
                      ? 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    }
                  `}
                  aria-label="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveDown?.(option.id)}
                  disabled={!canMoveDown}
                  className={`
                    p-1 rounded text-xs transition-colors
                    ${canMoveDown 
                      ? 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    }
                  `}
                  aria-label="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Rank Badge */}
              {rank && (
                <div className={`
                  px-3 py-1 rounded-full text-sm font-bold border-2
                  ${getRankColor(rank)}
                `}>
                  {getRankDisplay(rank)} Choice
                </div>
              )}
              
              {/* Restaurant Name */}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {option.name}
                </h3>
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(option.id);
              }}
              className="
                p-2 rounded-lg transition-all duration-200 z-10 relative
                text-slate-400 dark:text-slate-500 
                hover:text-red-600 dark:hover:text-red-400 
                hover:bg-red-50 dark:hover:bg-red-900/20
              "
              aria-label={`Remove ${option.name} from your choices`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
      onClick={() => onSelect(option.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {option.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click to add to your choices
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};