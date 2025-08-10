import { useQuery } from '@tanstack/react-query'
import { brandService } from '../services'

export const useBrands = () => {
  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getBrands(),
  })

  return {
    brands,
    isLoading,
    error,
  }
}