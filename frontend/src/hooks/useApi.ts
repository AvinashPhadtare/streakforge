
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Habit } from '@/lib/mock-data'

// Tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/api/v1/tasks')
      return res.data
    }
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; due_date?: string; priority?: string }) => {
      const res = await api.post('/api/v1/tasks', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/api/v1/tasks/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/tasks/${id}/complete`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/v1/tasks/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

// Habits
export function useHabits() {
  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await api.get('/api/v1/habits')
      return res.data
    }
  })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/api/v1/habits', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}

export function useLogHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/habits/${id}/log`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}

// Dashboard / Analytics
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/v1/analytics/dashboard')
      return res.data
    }
  })
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await api.get('/api/v1/streaks/me')
      return res.data
    }
  })
}

export function useXP() {
  return useQuery({
    queryKey: ['xp'],
    queryFn: async () => {
      const res = await api.get('/api/v1/xp/me')
      return res.data
    }
  })
}

export function useTodaySummary() {
  return useQuery({
    queryKey: ['today'],
    queryFn: async () => {
      const res = await api.get('/api/v1/daily/today')
      return res.data
    }
  })
}

export function useHeatmap(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['heatmap', startDate, endDate],
    queryFn: async () => {
      const res = await api.get(`/api/v1/daily/heatmap?start_date=${startDate}&end_date=${endDate}`)
      return res.data
    }
  })
}
