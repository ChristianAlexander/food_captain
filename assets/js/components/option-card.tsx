import React, { useState } from "react";

import { Card, Button, Input } from "./ui";
import { SessionOption } from "../schemas";

interface OptionCardProps {
  option: SessionOption;
  onSave?: (id: string, name: string) => Promise<void>;
  onCancel?: (id: string) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  onSave,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(!option.name.trim());
  const [editingName, setEditingName] = useState(option.name);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    if (!onSave) return;
    setIsEditing(true);
    setEditingName(option.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    const trimmedName = editingName.trim();

    if (!trimmedName && onCancel) {
      onCancel(option.id);
      return;
    }

    setIsSaving(true);
    await onSave(option.id, trimmedName);
    setIsSaving(false);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingName(option.name);
    if (onCancel) onCancel(option.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleInputChange = (value: string) => {
    setEditingName(value);
  };

  return (
    <Card className={isSaving ? "opacity-75" : ""}>
      <div className="space-y-3">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Input
                value={editingName}
                onChange={handleInputChange}
                placeholder="Restaurant name"
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={isSaving}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={!editingName.trim() || isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={startEditing}
              className="text-left w-full text-lg font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-lg p-1 -m-1"
              aria-label={`Edit restaurant name: ${option.name}`}
            >
              {option.name || "Unnamed Restaurant"}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Added {new Date(option.inserted_at).toLocaleDateString()}
            </p>
          </>
        )}
      </div>
    </Card>
  );
};
