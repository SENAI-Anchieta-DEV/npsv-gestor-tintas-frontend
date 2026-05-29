import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function AppDataTable({
  columns,
  rows,
  emptyMessage = "Nenhum registro encontrado.",
}) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderTop: "1px solid",
        borderTopColor: "divider",
        borderRadius: 0,
        backgroundColor: "transparent",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  py: 1.8,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow
                key={row.id || row.key || index}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} sx={{ py: 1.6 }}>
                    {column.render(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ py: 7, textAlign: "center" }}>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}