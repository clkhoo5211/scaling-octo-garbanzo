/**
 * Tests for useAuctions hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAuctions,
  useAuctionBids,
  usePlaceBid,
  useUserBids,
} from './useAuctions';
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
    (useAppStore.getState as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
    });
    (useAccount as jest.Mock).mockReturnValue({
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
    (useAccount as jest.Mock).mockReturnValue({
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
    expect(result.current.error).toEqual(new Error('Wallet not connected'));
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

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(supabaseApi.getAuctions).not.toHaveBeenCalled();
  });
});

