import { useState } from 'react';

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // includes, а не Boolean(indexOf): у первого элемента index === 0, а Boolean(0) === false.
  const isFavorite = (id: string) => favorites.includes(id);

  const toggle = (id: string) => {
    // Новый массив, иначе React не видит изменения (тот же объект в памяти).
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return { favorites, isFavorite, toggle };
}
