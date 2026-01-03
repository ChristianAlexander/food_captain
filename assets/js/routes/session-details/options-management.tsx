import React, { useRef } from "react";
import { eq, Transaction, useLiveQuery } from "@tanstack/react-db";
import { uuidv7 } from "uuidv7";

import { Card, OptionCard, useToast } from "../../components";
import { SessionOption } from "../../schemas";
import { optionsCollection } from "../../collections";
import { createSessionOptionTransaction } from "../../mutations";

interface OptionsManagementProps {
  sessionId: string;
}

export const OptionsManagement: React.FC<OptionsManagementProps> = ({
  sessionId,
}) => {
  const pendingTransactions = useRef<Map<string, Transaction>>(new Map());
  const { addToast } = useToast();
  const { data: options } = useLiveQuery(
    (q) =>
      q
        .from({ option: optionsCollection })
        .where(({ option }) => eq(option.session_id, sessionId))
        .orderBy(({ option }) => option.inserted_at, "desc"),
    [sessionId],
  );

  const onAddOption = async () => {
    try {
      const optionId = uuidv7();
      const tx = createSessionOptionTransaction();

      tx.mutate(() => {
        optionsCollection.insert({
          id: optionId,
          name: "",
          session_id: sessionId,
          inserted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      pendingTransactions.current.set(optionId, tx);
    } catch (error) {
      console.error("Failed to create restaurant option:", error);
      addToast(
        "Failed to create restaurant option. Please try again.",
        "error",
      );
    }
  };

  const onSaveOption = async (optionId: string, name: string) => {
    const pendingTx = pendingTransactions.current.get(optionId);

    if (pendingTx) {
      try {
        pendingTx.mutate(() => {
          optionsCollection.update(optionId, (d) => {
            d.name = name;
            d.updated_at = new Date().toISOString();
          });
        });

        await pendingTx.commit();
      } catch (error) {
        console.error("Failed to save restaurant option:", error);
        addToast(
          "Failed to save restaurant option. Please try again.",
          "error",
        );
      }

      pendingTransactions.current.delete(optionId);
    } else {
      try {
        const tx = optionsCollection.update(optionId, (d) => {
          d.name = name;
          d.updated_at = new Date().toISOString();
        });

        await tx.isPersisted.promise;
      } catch (error) {
        console.error("Failed to update restaurant option:", error);
        addToast(
          "Failed to update restaurant option. Please try again.",
          "error",
        );
      }
    }
  };

  const onCancelOption = (optionId: string) => {
    const pendingTx = pendingTransactions.current.get(optionId);

    if (pendingTx) {
      pendingTx.rollback();

      pendingTransactions.current.delete(optionId);
    }
  };

  const onAddDemoRestaurants = () => {
    const demoRestaurants = [
      "Pizza Palace",
      "Burger Barn",
      "Taco Town",
      "Sushi Spot",
      "Pasta Place",
    ];

    const tx = createSessionOptionTransaction();
    demoRestaurants.forEach((name, index) => {
      tx.mutate(() => {
        optionsCollection.insert({
          id: uuidv7(),
          name,
          session_id: sessionId,
          inserted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    });
    tx.commit().catch((error) => {
      console.error("Failed to create demo restaurant:", error);
    });

    addToast("Added demo restaurants for testing!", "success");
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

            <button
              onClick={onAddDemoRestaurants}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-300 dark:border-slate-600"
            >
              Add Demo Restaurants
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
              <OptionCard
                key={option.id}
                option={option}
                onSave={onSaveOption}
                onCancel={onCancelOption}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
