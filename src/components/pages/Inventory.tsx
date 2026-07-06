import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Table, TableBody, TablePagination, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CSVLink } from 'react-csv';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';


export const Inventory = () => {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    

    const [stockList, setStockList] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({ id: null, date: '', name: '', category: '', hsn: '', price: '', qty: '', expiry: '' });

    const fetchStockList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/inventory');
            setStockList(response.data);
        } catch (error) { console.error("Error fetching data:", error); }
    };

    useEffect(() => { fetchStockList(); }, []);

    // மொத்த தொகை கணக்கீடு (Summary)


    const handleSave = async () => {
        try {
            if (formData.id) {
                await axios.put(`http://localhost:5000/api/inventory/${formData.id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/inventory', formData);
            }
            fetchStockList();
            setOpen(false);
            setFormData({ id: null, date: '', name: '', category: '', hsn: '', price: '', qty: '', expiry: '' });
        } catch (error) { console.error("Error saving data:", error); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure?")) {
            await axios.delete(`http://localhost:5000/api/inventory/${id}`);
            fetchStockList();
        }
    };

    const [selectedMonth, setSelectedMonth] = useState<Date | null>();

    // Filter logic-ஐ மாற்றவும்
    const filteredList = useMemo(() => {
        if (!selectedMonth) return stockList;
        const formattedMonth = format(selectedMonth, 'yyyy-MM');
        return stockList.filter(item => item.date.startsWith(formattedMonth));
    }, [stockList, selectedMonth]);

    const totalInventoryValue = filteredList.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);

    return (
        <Box sx={{ p: 3 }}>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    views={['year', 'month']}
                    label="Filter by Month"
                    value={selectedMonth}
                    onChange={(newvalue) => setSelectedMonth(newvalue)}
                    slotProps={{ textField: { sx: { width: 200 } } }}
                />
            </LocalizationProvider>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Inventory Management</Typography>
                
                <Box>
                    <CSVLink data={filteredList} filename="inventory.csv" style={{ textDecoration: 'none', marginRight: '10px' }}>
                        <Button variant="outlined">Export Excel</Button>
                    </CSVLink>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormData({ id: null }); setOpen(true); }}>Add Stock</Button>
                </Box>
            </Box>

            {/* Summary Box */}
            <Paper sx={{ p: 2, mb: 2, textAlign: 'right', fontWeight: 'bold' }}>
                <Typography variant="h6">Total Inventory Value: ₹{totalInventoryValue.toLocaleString()}</Typography>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell>
                            <TableCell>HSN</TableCell><TableCell>Qty</TableCell><TableCell>Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.date}</TableCell><TableCell>{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell><TableCell>{item.hsn}</TableCell>
                                <TableCell>{item.qty}</TableCell><TableCell>₹{item.price}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => { setFormData(item); setOpen(true); }}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{formData.id ? "Edit Stock" : "Add New Stock"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid sx={{width:'360px'}}><TextField fullWidth label="" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></Grid>
                        <Grid sx={{width:'360px'}}><TextField fullWidth label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></Grid>
                        <Grid sx={{width:'360px'}}>
                            <TextField fullWidth label="Category" select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                {['Brand 1', 'Brand 2', 'Brand 3'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid sx={{width:'360px'}}><TextField fullWidth label="HSN" value={formData.hsn} onChange={(e) => setFormData({ ...formData, hsn: e.target.value })} /></Grid>
                        <Grid sx={{width:'360px'}}><TextField fullWidth label="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></Grid>
                        <Grid sx={{width:'360px'}}><TextField fullWidth label="Qty" type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};