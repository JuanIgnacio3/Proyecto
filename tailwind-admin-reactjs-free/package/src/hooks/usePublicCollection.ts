import { useEffect, useState } from 'react';
import { publicGet } from 'src/lib/publicApi';

type PublicListResponse<Raw> = {
  data: Raw[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
};

export type PublicCollectionState<Item> = {
  items: Item[];
  loading: boolean;
  error: boolean;
};

/**
 * Carga generica de una coleccion publica paginada. Resuelve fetch, estados
 * (loading/error; el vacio se deriva de `items.length`), cancelacion y la
 * adaptacion de cada registro. Los hooks concretos (usePublicNews,
 * usePublicCalendar) solo aportan el `path` y un `adapt` estable.
 */
export function usePublicCollection<Raw, Item>(
  path: string,
  adapt: (raw: Raw) => Item,
  limit = 3,
): PublicCollectionState<Item> {
  const [state, setState] = useState<PublicCollectionState<Item>>({
    items: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let active = true;
    setState({ items: [], loading: true, error: false });

    publicGet<PublicListResponse<Raw>>(`${path}?page=1&page_size=${limit}`)
      .then((res) => {
        if (!active) return;
        setState({ items: res.data.map(adapt), loading: false, error: false });
      })
      .catch(() => {
        if (active) setState({ items: [], loading: false, error: true });
      });

    return () => {
      active = false;
    };
  }, [path, adapt, limit]);

  return state;
}
