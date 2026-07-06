import { Box, Typography, Paper, TextField, Button, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { useState, useEffect } from 'react';

export const Expense = () => {
  const [expenseData, setExpenseData] = useState({ category: '', amount: '', expense_date: '', description: '' });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [filterDate, setFilterDate] = useState('');

 // Expense.tsx-ல்
const handleChange = (e: any) => {
  setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  console.log("Current state:", expenseData); // ஸ்டேட் சரியாக மாறுகிறதா என்று பார்க்க
};

  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const addExpense = async () => {
    const payload = {
      category: expenseData.category,
      description: expenseData.description,
      amount: parseFloat(expenseData.amount),
      expense_date: expenseData.expense_date
    };

    await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setExpenseData({ amount: '', expense_date: '', category: '', description: '' });
    fetchExpenses();
  };

  const filteredData = expenses.filter(row =>
    filterDate ? row.expense_date?.startsWith(filterDate) : true
  );

  useEffect(() => { fetchExpenses(); }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Expense Tracking</Typography>

      {/* Input Form */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Expense Category" name="category" select value={expenseData.category} onChange={handleChange}>
              <MenuItem value="Transport">Transport</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Salary">Salary</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Amount (₹)" name="amount" type="number" value={expenseData.amount} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
           
            <TextField
              fullWidth
              label="Date"
              name="expense_date" // இங்கே 'date'-க்கு பதிலாக 'expense_date' என மாற்றவும்
              type="date"
              value={expenseData.expense_date}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" name="description" multiline rows={2} value={expenseData.description} onChange={handleChange} />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={addExpense}>Add Expense</Button>
      </Paper>

      {/* Records Table */}
      <Paper sx={{ p: 3 }}>
        <TextField
          type="month"
          label="Filter by Month"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Description</TableCell><TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * 5, page * 5 + 5).map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.expense_date?.split('T')[0]}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>₹{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={5}
          rowsPerPageOptions={[5]}
        />
      </Paper>
    </Box>
  );
};