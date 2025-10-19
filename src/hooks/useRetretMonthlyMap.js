// hooks/useRetretMonthlyMap.js
import { useEffect, useState } from "react";
import { get } from "../config/api";
export default function useRetretMonthlyMap(year, month) {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await get(
        `/retreats/monthly-map?year=${year}&month=${month}`
      );
      setData(res);
    })();
  }, [year, month]);
  return data;
}
