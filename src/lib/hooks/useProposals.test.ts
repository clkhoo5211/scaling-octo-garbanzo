/**
 * Tests for useProposals hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import React from 'react';
import {
  useProposals,
  useVotes,
  useVote,
  useUserVote,
} from './useProposals';
import * as supabaseApi from '@/lib/api/supabaseApi';
import { useAppStore } from '@/lib/stores/appStore';
import { useAppKitAccount } from '@reown/appkit/react';

// Mock dependencies
jest.mock('@/lib/api/supabaseApi');
jest.mock('@/lib/stores/appStore', () => {
  const mockStore = {
    userId: 'test-user-id',
  };
  const useAppStoreMock = jest.fn(() => mockStore);
  (useAppStoreMock as unknown as { getState: jest.Mock }).getState = jest.fn(() => mockStore);
  return {
    useAppStore: useAppStoreMock,
  };
});
jest.mock('@reown/appkit/react', () => ({
  useAppKitAccount: jest.fn(() => ({
    address: undefined,
    isConnected: false,
  })),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [],
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  useAppKit: () => ({
    open: jest.fn(),
  }),
  AppKitProvider: ({ children }) => children,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return Wrapper;
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
    (useAppKitAccount as jest.Mock).mockReturnValue({
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
    const mockStoreWithoutUser = {
      userId: null,
    };
    const useAppStoreMock = useAppStore as jest.Mock;
    useAppStoreMock.mockReturnValue(mockStoreWithoutUser);
    (useAppStoreMock as unknown as { getState: jest.Mock }).getState = jest.fn(() => mockStoreWithoutUser);

    const { result } = renderHook(() => useVote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      proposalId: 'proposal-1',
      voteOption: 'yes',
      votingPower: 100,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('User not authenticated');
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

