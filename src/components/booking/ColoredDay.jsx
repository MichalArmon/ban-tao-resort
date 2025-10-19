// components/ColoredDay.jsx
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
export default function ColoredDay({
  day,
  outsideCurrentMonth,
  monthlyMap,
  ...other
}) {
  const iso = dayjs(day).format("YYYY-MM-DD");
  const color = monthlyMap?.days?.[iso]?.[0]?.color;
  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={
        color
          ? {
              border: `1px solid ${color}`,
              bgcolor: `${color}22`,
              "&:hover": { bgcolor: `${color}44` },
            }
          : {}
      }
    />
  );
}
