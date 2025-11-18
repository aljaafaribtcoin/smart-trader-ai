import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/api';
import { Account, AccountStats, AccountBalance } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch account data
 */
export const useAccount = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.ACCOUNT, userId],
    queryFn: async () => {
      // For now, use mock data
      return accountService.getMockAccount();
      
      // When API is ready, uncomment this:
      // const response = await accountService.getAccount(userId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to fetch account statistics
 */
export const useAccountStats = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['account-stats', userId],
    queryFn: async () => {
      // For now, use mock data
      return accountService.getMockAccountStats();
      
      // When API is ready:
      // const response = await accountService.getAccountStats(userId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to fetch account balance (real-time)
 */
export const useAccountBalance = (userId: string) => {
  return useQuery({
    queryKey: ['account-balance', userId],
    queryFn: async () => {
      const response = await accountService.getAccountBalance(userId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: CACHE_TIMES.SHORT, // Refresh more frequently
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
