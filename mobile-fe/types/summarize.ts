export interface EventDetail {
  event_name: string;
  time: string;
  location: string;
  note: string;
}

export interface SummarizeRequest {
  text: string;
}

export interface SummarizeResponse {
  events: EventDetail[];
  original_length: number;
  status: string;
}

export interface SummarizeState {
  isLoading: boolean;
  error: string | null;
  result: SummarizeResponse | null;
}
