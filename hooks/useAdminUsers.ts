"use client";

import { useState, useEffect, useCallback } from "react";
import type { SubscriptionStatus } from "@prisma/client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  walletAddress: string | null;
  zapTokens: number;
  hearts: number;
  totalExperiencePoints: number;
  totalCurriculumsCompleted: number;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  userCurriculumTokens: {
    id: string;
    curriculumId: string;
    quantity: number;
    curriculum: {
      id: string;
      title: string;
    };
  }[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  pagination: Pagination;
  searchEmail: string;
  setSearchEmail: (email: string) => void;
  search: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
}

const LIMIT = 20;

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1
  });

  const fetchUsers = useCallback(async (page: number, email?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString()
      });

      if (email) {
        params.append("email", email);
      }

      const response = await fetch(`/api/admin/users/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination({
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages
        });
      } else {
        console.error("Error fetching users:", data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    async (page: number = 1) => {
      await fetchUsers(page, searchEmail || undefined);
    },
    [fetchUsers, searchEmail]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchUsers(page, searchEmail || undefined);
    },
    [fetchUsers, searchEmail]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return {
    users,
    loading,
    pagination,
    searchEmail,
    setSearchEmail,
    search,
    goToPage
  };
}
