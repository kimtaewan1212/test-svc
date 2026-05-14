import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, updateMe, deleteMe } from '../api/userApi'

const QUERY_KEY = ['me']

export function useMe() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getMe })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteMe() {
  return useMutation({ mutationFn: deleteMe })
}
