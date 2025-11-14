import React from "react";
import moment from "moment-timezone";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * ColoredRetreatDay
 * יום צבוע בתאריכון לפי retreatDates
 *
 * Props:
 * - day
 * - retreatDates
 * - onSelect(info, iso)
 * - ...rest → כל שאר הפרופס ש-DatePicker שולח
 */
export default function ColoredRetreatDay({
  day,
  retreatDates,
  onSelect,
  className,
  ...rest
}) {
  if (!day || !moment.isMoment(day)) {
    return <PickersDay {...rest} day={day} className={className} />;
  }

  const iso = moment(day).format("YYYY-MM-DD");
  const info = retreatDates?.[iso]?.[0];

  // אם אין ריטריט ביום
  if (!info) {
    return <PickersDay {...rest} day={day} className={className} />;
  }

  const baseColor = info.color || "#66bb6a";
  const fill = alpha(baseColor, 0.55);
  const hoverFill = alpha(baseColor, 0.7);

  return (
    <Tooltip title={info.name} placement="top" arrow>
      <span>
        <PickersDay
          {...rest}
          day={day}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect?.(info, iso);
          }}
          sx={{
            position: "relative",
            cursor: "pointer",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 2,
              borderRadius: "50%",
              backgroundColor: fill,
              pointerEvents: "none",
              transition: "background-color 120ms ease",
            },
            "&:hover::before": { backgroundColor: hoverFill },
            "&.Mui-selected": {
              backgroundColor: "primary.main !important",
              color: "primary.contrastText !important",
            },
          }}
        />
      </span>
    </Tooltip>
  );
}
