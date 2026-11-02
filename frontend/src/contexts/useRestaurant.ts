import { useContext } from 'react';
import { RestaurantContext } from './restaurantContextDef';

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

