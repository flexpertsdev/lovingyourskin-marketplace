import { useQuery } from '@tanstack/react-query'
import { productService } from '../services'

export const useBrands = () => {
  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productService.getBrands(),
  })

  return {
    brands,
    isLoading,
    error,
  }
}