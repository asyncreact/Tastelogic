// src/hooks/useReservation.js
import { useContext } from 'react';
import { ReservationContext } from '../context/ReservationContext';

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation debe usarse dentro de ReservationProvider');
  }
  return context;
}
