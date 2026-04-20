export type User = {
  id: string;
  username: string;
  email: string;
};

export type Question = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

/* ─── Groups ─── */
export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
  my_role?: string;
  is_member?: boolean;
}

export interface GroupMember {
  group_id: number;
  user_id: number;
  username: string;
  role: 'member' | 'admin';
  joined_at: string;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface GroupJoinRequest {
  id: number;
  group_id: number;
  group_name?: string;
  user_id: number;
  username?: string;
  status: JoinRequestStatus;
  message: string;
  decided_by?: number | null;
  decided_at?: string | null;
  created_at: string;
}

/* ─── Submissions ─── */
export type ProblemType = 'standard' | 'subjective';

export type SubmissionStatus =
  | 'pending'
  | 'pending_review'
  | 'judging'
  | 'accepted'
  | 'rejected'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compilation_error'
  | 'partial';

export interface MySubmissionSummary {
  id: number;
  problem_id: number;
  problem_slug: string;
  problem_title: string;
  problem_type: ProblemType;
  contest_id?: number | null;
  contest_title?: string;
  status: SubmissionStatus;
  language: string;
  passed_count: number;
  total_count: number;
  manual_score?: number | null;
  submitted_at: string;
}

export interface MySubmissionDetail extends MySubmissionSummary {
  source_code: string;
  feedback?: string;
  grader_name?: string;
  graded_at?: string | null;
  is_locked?: boolean;
}
