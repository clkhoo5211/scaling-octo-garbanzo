/**
 * Tests for useProposals hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useProposals,
  useVotes,
  useVote,
  useUserVote,
} from './useProposals';
import * as supabaseApi from '@/lib/api/supabaseApi';
import { useAppStore } from '@/lib/stores/appStore';
import { useAccount } from '@reown/appkit/react';

// Mock dependencies
jest.mock('@/lib/api/supabaseApi');
jest.mock('@/lib/stores/appStore');
jest.mock('@reown/appkit/react');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProposals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch proposals', async () => {
    const mockProposals = [
      {
        id: '1',
        title: 'Test Proposal',
        description: 'Test Description',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getProposals as jest.Mock).mockResolvedValue({
      data: mockProposals,
      error: null,
    });

    const { result } = renderHook(() => useProposals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProposals);
  });

  it('should fetch proposals with filters', async () => {
    const mockProposals = [
      {
        id: '1',
        title: 'Test Proposal',
        description: 'Test Description',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getProposals as jest.Mock).mockResolvedValue({
      data: mockProposals,
      error: null,
    });

    const { result } = renderHook(
      () => useProposals({ status: 'active', limit: 10 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.getProposals).toHaveBeenCalledWith({
      status: 'active',
      limit: 10,
    });
  });
});

describe('useVotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch votes for a proposal', async () => {
    const mockVotes = [
      {
        id: '1',
        proposal_id: 'proposal-1',
        voter_id: 'user-1',
        vote_option: 0,
        voting_power: 100,
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getVotes as jest.Mock).mockResolvedValue({
      data: mockVotes,
      error: null,
    });

    const { result } = renderHook(() => useVotes('proposal-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockVotes);
  });
});

describe('useVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore.getState as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
    });
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });
  });

  it('should cast a vote', async () => {
    (supabaseApi.createVote as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useVote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      proposalId: 'proposal-1',
      voteOption: 'yes',
      votingPower: 100,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.createVote).toHaveBeenCalledWith({
      proposalId: 'proposal-1',
      voterId: 'test-user-id',
      voteOption: 'yes',
      votingPower: 100,
      transactionHash: undefined,
    });
  });

  it('should throw error if user not authenticated', async () => {
    (useAppStore.getState as jest.Mock).mockReturnValue({
      userId: null,
    });

    const { result } = renderHook(() => useVote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      proposalId: 'proposal-1',
      voteOption: 'yes',
      votingPower: 100,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('User not authenticated'));
  });
});

describe('useUserVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user vote for a proposal', async () => {
    const mockVotes = [
      {
        id: '1',
        proposal_id: 'proposal-1',
        voter_id: 'user-1',
        vote_option: 0,
        voting_power: 100,
        transaction_hash: '0xabc',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getVotes as jest.Mock).mockResolvedValue({
      data: mockVotes,
      error: null,
    });

    const { result } = renderHook(() => useUserVote('proposal-1', 'user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      option: 'yes',
      votingPower: 100,
      transactionHash: '0xabc',
    });
  });

  it('should return null if user has not voted', async () => {
    (supabaseApi.getVotes as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useUserVote('proposal-1', 'user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

