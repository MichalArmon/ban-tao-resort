import * as React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  TableSortLabel,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useBooking } from "../../../context/BookingContext";

const STATUS_COLORS = {
  Confirmed: "success",
  Pending: "warning",
  Canceled: "error",
};

export default function AdminBookings() {
  const { bookings, loading, fetchAllBookings } = useBooking();
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [order, setOrder] = React.useState("desc");

  React.useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const handleSort = (key) => {
    const isAsc = sortBy === key && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setSortBy(key);
  };

  const sortedBookings = React.useMemo(() => {
    return [...bookings].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (sortBy === "createdAt" || sortBy === "checkInDate") {
        return order === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      }
      return order === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [bookings, sortBy, order]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        📋 All Bookings
      </Typography>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      ) : bookings.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          אין הזמנות להצגה 💤
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f0f5f4" }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "createdAt"}
                    direction={order}
                    onClick={() => handleSort("createdAt")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "type"}
                    direction={order}
                    onClick={() => handleSort("type")}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedBookings.map((b) => (
                <TableRow key={b._id} hover>
                  <TableCell>
                    {new Date(b.createdAt).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {b.type}
                  </TableCell>
                  <TableCell>{b.guestInfo?.fullName || "—"}</TableCell>
                  <TableCell>{b.guestInfo?.email || "—"}</TableCell>
                  <TableCell>
                    {b.totalPrice ? b.totalPrice.toLocaleString() + " ฿" : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.status || "Pending"}
                      color={STATUS_COLORS[b.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
