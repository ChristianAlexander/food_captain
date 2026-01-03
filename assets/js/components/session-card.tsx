import React from 'react';
import { Link } from '@tanstack/react-router';
import { Session } from '../schemas';
import { Card } from './ui';

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  const stateConfig = {
    open: {
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      label: "Accepting Options",
      borderColor: "border-green-200 dark:border-green-800"
    },
    closed: {
      color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
      label: "Voting Complete",
      borderColor: "border-slate-200 dark:border-slate-600"
    }
  };

  const config = stateConfig[session.state];
  const formattedDate = new Date(session.inserted_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const cardContent = (
    <Card 
      hover 
      className="h-full"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
          {session.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Created {formattedDate}
        </p>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to="/app/sessions/$sessionId"
      params={{ sessionId: session.id }}
      className="block"
    >
      {cardContent}
    </Link>
  );
};