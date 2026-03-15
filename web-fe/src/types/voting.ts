export type VotingStatus = "ONGOING" | "ENDED" | "UPCOMING";
export type TargetScope = "ALL" | "BLOCK" | "FLOOR";

export interface VotingOption {
	id: number;
	name: string;
	description?: string;
	votingId?: number;
}

export interface TargetBlockConfig {
	blockId: number;
	blockName?: string;
	targetFloorNumbers: string[];
}

export interface VotingData {
	id: number;
	title: string;
	content: string;
	targetScope: TargetScope;
	isRequired: boolean;
	startTime: string;
	endTime: string;
	status: VotingStatus;
	isActive: boolean;
	fileUrls: string[] | null;
	options: VotingOption[];
	targetBlocks: TargetBlockConfig[];
	createdAt: string;
	updatedAt: string;
	totalEligibleVoters?: number;
	totalVotesCast?: number;
	votingRatio?: string;
	votingPercentage?: number;
	scopeDisplay?: string;
	leadingOption?: string | null;
}

export interface VotingResultOption {
	optionId: number;
	optionName: string;
	totalArea: number;
	voteCount: number;
	percentage: number;
}

export interface VotingStatistic {
	votingId: number;
	votingTitle: string;
	status: VotingStatus;
	totalEligibleArea?: number;
	votedArea?: number;
	participationRate: number;
	results: VotingResultOption[];
}

export interface VotingPayload {
	title: string;
	content: string;
	isRequired: boolean;
	startTime: string;
	endTime: string;
	targetScope: string;
	options: {
		id?: number;
		name: string;
		description?: string;
	}[];
	targetBlocks: {
		blockId: number;
		targetFloorNumbers: string[];
	}[];

	files?: File[];
}
