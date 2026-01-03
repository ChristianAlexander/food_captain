import * as z from "zod";

// Core data schemas
export const SessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(["open", "closed"]),
  inserted_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  user_id: z.string(),
});

export const SessionOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  session_id: z.string(),
  inserted_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const SessionVoteSchema = z.object({
  id: z.string(),
  rank: z.number(),
  session_id: z.string(),
  option_id: z.string(),
});

// Derived types using z.infer
export type Session = z.infer<typeof SessionSchema>;
export type SessionOption = z.infer<typeof SessionOptionSchema>;
export type SessionVote = z.infer<typeof SessionVoteSchema>;

// Voting state schemas
export const VotingStateSchema = z.object({
  selectedOptions: z.array(z.string()),
  votes: z.record(z.string(), z.number()), // optionId -> rank (1-based)
});

export const UserVoteSchema = z.object({
  userId: z.string(),
  votes: z.record(z.string(), z.number()),
  submittedAt: z.iso.datetime(),
});

export type VotingState = z.infer<typeof VotingStateSchema>;
export type UserVote = z.infer<typeof UserVoteSchema>;
