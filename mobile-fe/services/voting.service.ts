import { Option, TargetBlock, VoteResult, Voting } from '@/types/voting';
import { api } from './api';

const URI = '/votings';

export const VotingService = {
  getMine: async (): Promise<{ data: Voting[] }> => {
    const response = await api.get(`${URI}/my`);
    return {
      data: response.data.data.map(mapVoting),
    };
  },

  getById: async (id: number): Promise<{ data: Voting }> => {
    const response = await api.get(`${URI}/${id}`);
    return {
      data: mapVoting(response.data.data),
    };
  },

  vote: async (id: number, optionId: number): Promise<void> => {
    await api.post(`${URI}/${id}/vote`, { optionId });
  },

  getStatistics: async (id: number): Promise<any> => {
    const response = await api.get(`${URI}/${id}/statistics`);
    return {
      data: mapResult(response.data.data),
    };
  },
};

const mapVoting = (raw: any): Voting => {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    start_time: raw.startTime,
    end_time: raw.endTime,
    is_required: raw.isRequired,
    created_at: raw.createdAt,
    file_urls: raw.fileUrls || [],
    status: raw.status || undefined,
    voted_option: raw.votedOption,
    target_blocks: (raw.targetBlocks || []).map(
      (tb: any): TargetBlock => ({
        id: tb.block?.id || tb.id,
        name: tb.block?.name || 'N/A',
      })
    ),

    options: (raw.options || []).map(
      (option: any): Option => ({
        id: option.id,
        name: option.name,
        description: option.description,
      })
    ),
  };
};

const mapResult = (raw: any): VoteResult => {
  return {
    voting_id: raw.votingId,
    voted_area: raw.votedArea,
    title: raw.votingTitle,
    total: raw.totalEligibleArea,
    options: (raw.results || []).map((option: any): any => ({
      id: option.optionId,
      name: option.optionName,
      vote_count: option.voteCount,
      total_area: option.totalArea,
      percentage: option.percentage,
    })),
  };
};
