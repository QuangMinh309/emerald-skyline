export type VotingStatus = 'ONGOING' | 'UPCOMING' | 'ENDED' | 'ongoing' | 'upcoming' | 'closed';

export interface TargetBlock {
  id: number;
  name: string;
}

export interface Voting {
  id: number;
  title: string;
  content: string;
  is_required: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at?: string;
  file_urls: string[];
  target_blocks: TargetBlock[];
  options: Option[];
  status?: VotingStatus;
  voted_option?: ResidentOption;
}

export interface Option {
  id: number;
  name: string;
  description?: string;
  vote_count?: number;
  voting_id?: number;
}

export interface ResidentOption {
  id: number;
  name: string;
}

export interface VoteResult {
  voting_id: number;
  voted_area: number;
  title: string;
  total: number;
  options: {
    id: number;
    name: string;
    vote_count: number;
    total_area: number;
    percentage: number;
  }[];
}
