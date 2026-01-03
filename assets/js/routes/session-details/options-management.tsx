import React from "react";
import { eq, Transaction, useLiveQuery } from "@tanstack/react-db";
import { uuidv7 } from "uuidv7";

import { Card, OptionCard, useToast } from "../../components";
import { SessionOption } from "../../schemas";

interface OptionsManagementProps {
  sessionId: string;
}

export const OptionsManagement: React.FC<OptionsManagementProps> = ({
  sessionId,
}) => {
  const { addToast } = useToast();
  const options = [] as SessionOption[];

  const onAddOption = async () => {
    console.log("Add an option");
    addToast("Add an option", "info");
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Restaurant Options ({options.length})
      </h3>

      {options.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            No restaurant options yet
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
            Add some restaurant options to get started. Your crew can then vote
            on their favorites!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onAddOption}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Add First Restaurant
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Ghost card for adding new restaurant */}
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <button
                onClick={onAddOption}
                className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-lg"
                aria-label="Add new restaurant option"
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm font-medium">Add Restaurant</span>
              </button>
            </Card>
            {options.map((option) => (
              <OptionCard key={option.id} option={option} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
