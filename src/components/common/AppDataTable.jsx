import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export default function AppDataTable({ columns, rows, emptyMessage = "Nenhum registro encontrado." }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderTop: "1px solid #E5E7EB", borderRadius: 0 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} sx={{ fontWeight: 800, color: "text.primary" }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow key={row.key || index} hover>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(row, index)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ py: 6, textAlign: "center" }}>
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
