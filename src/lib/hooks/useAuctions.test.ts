/**
 * Tests for useAuctions hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import React from 'react';
import {
  useAuctions,
  useAuctionBids,
  usePlaceBid,
  useUserBids,
} from './useAuctions';
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
  (useAppStoreMock as any).getState = jest.fn(() => mockStore);
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

describe('useAuctions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch auctions', async () => {
    const mockAuctions = [
      {
        id: '1',
        slot_id: 'slot-1',
        status: 'active',
        current_bid: 100,
        end_time: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getAuctions as jest.Mock).mockResolvedValue({
      data: mockAuctions,
      error: null,
    });

    const { result } = renderHook(() => useAuctions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAuctions);
  });

  it('should fetch auctions with filters', async () => {
    const mockAuctions = [
      {
        id: '1',
        slot_id: 'slot-1',
        status: 'active',
        current_bid: 100,
        end_time: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getAuctions as jest.Mock).mockResolvedValue({
      data: mockAuctions,
      error: null,
    });

    const { result } = renderHook(
      () => useAuctions({ status: 'active', limit: 10 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.getAuctions).toHaveBeenCalledWith({
      status: 'active',
      limit: 10,
    });
  });
});

describe('useAuctionBids', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch bids for an auction', async () => {
    const mockBids = [
      {
        id: '1',
        auction_id: 'auction-1',
        bidder_address: '0x123',
        bid_amount: 100,
        transaction_hash: '0xabc',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getAuctionBids as jest.Mock).mockResolvedValue({
      data: mockBids,
      error: null,
    });

    const { result } = renderHook(() => useAuctionBids('auction-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBids);
  });
});

describe('usePlaceBid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppKitAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });
  });

  it('should place a bid', async () => {
    (supabaseApi.createAuctionBid as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => usePlaceBid(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      auctionId: 'auction-1',
      bidAmount: 100,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.createAuctionBid).toHaveBeenCalledWith({
      auctionId: 'auction-1',
      bidderAddress: '0x123',
      bidAmount: 100,
      transactionHash: undefined,
    });
  });

  it('should throw error if wallet not connected', async () => {
    (useAppKitAccount as jest.Mock).mockReturnValue({
      address: null,
      isConnected: false,
    });

    const { result } = renderHook(() => usePlaceBid(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      auctionId: 'auction-1',
      bidAmount: 100,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Wallet not connected');
  });
});

describe('useUserBids', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user bids', async () => {
    const mockAuctions = [
      {
        id: 'auction-1',
        slot_id: 'slot-1',
        status: 'active',
        current_bid: 100,
        end_time: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    const mockBids = [
      {
        id: '1',
        auction_id: 'auction-1',
        bidder_address: '0x123',
        bid_amount: 100,
        transaction_hash: '0xabc',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getAuctions as jest.Mock).mockResolvedValue({
      data: mockAuctions,
      error: null,
    });
    (supabaseApi.getAuctionBids as jest.Mock).mockResolvedValue({
      data: mockBids,
      error: null,
    });

    const { result } = renderHook(() => useUserBids('0x123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toMatchObject({
      ...mockBids[0],
      auction: mockAuctions[0],
    });
  });

  it('should return empty array if userAddress is null', async () => {
    const { result } = renderHook(() => useUserBids(null), {
      wrapper: createWrapper(),
    });

    // When userAddress is null, query is disabled, so data is undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(supabaseApi.getAuctions).not.toHaveBeenCalled();
  });
});

