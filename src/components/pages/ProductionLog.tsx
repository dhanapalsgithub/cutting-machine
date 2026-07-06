import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, MenuItem, Tabs, Tab, Grid, TablePagination, Select, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export const ProductionLog = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedMachine, setSelectedMachine] = useState("All");

    const [formData, setFormData] = useState({
        production_date: new Date().toISOString().split('T')[0],
        machine_name: '', operator_name: '', product_name: '',
        produced_qty: '', waste_qty: ''
    });

    const machines = ["Extrude Machine 1", "Extrude Machine 2", "Cutting Machine"];
    const operators = ["Bala", "Muruga", "Arun", "Devi"];

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/production_log');
            setLogs(response.data);
        } catch (err) { console.error("Error fetching logs:", err); }
    };

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/production_log', {
                ...formData,
                produced_qty: Number(formData.produced_qty),
                waste_qty: Number(formData.waste_qty)
            });
            alert("Log Saved!");
            fetchLogs();
            setFormData({
                production_date: new Date().toISOString().split('T')[0],
                machine_name: '', operator_name: '', product_name: '',
                produced_qty: '', waste_qty: ''
            });
        } catch (err) { alert("Error saving log"); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            try {
                await axios.delete(`http://localhost:5000/api/production_log/${id}`);
                fetchLogs();
            } catch (err) { alert("Delete failed"); }
        }
    };

    const [editOpen, setEditOpen] = useState(false);
    const [currentLog, setCurrentLog] = useState<any>(null);

    const handleEditSave = async () => {
        try {
            await axios.put(`http://localhost:5000/api/production_log/${currentLog.id}`, currentLog);
            fetchLogs();
            setEditOpen(false);
        } catch (err) { alert("Update failed"); }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesMonth = log.production_date.startsWith(filterMonth);
            const matchesMachine = selectedMachine === "All" || log.machine_name === selectedMachine;
            return matchesMonth && matchesMachine;
        });
    }, [logs, filterMonth, selectedMachine]);

    const summaryData = useMemo(() => {
        const summary = machines.map(machine => {
            const machineLogs = filteredLogs.filter(log => log.machine_name === machine);
            return {
                machine,
                totalQty: machineLogs.reduce((sum, log) => sum + Number(log.produced_qty || 0), 0),
                totalWaste: machineLogs.reduce((sum, log) => sum + Number(log.waste_qty || 0), 0)
            };
        });

        const grandTotalQty = summary.reduce((sum, item) => sum + item.totalQty, 0);
        const grandTotalWaste = summary.reduce((sum, item) => sum + item.totalWaste, 0);

        return { summary, grandTotalQty, grandTotalWaste };
    }, [filteredLogs]);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredLogs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ProductionLogs");
        XLSX.writeFile(wb, `Production_Report_${filterMonth}.xlsx`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Production Management</Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Log Entry" />
                <Tab label="Monthly Logs & Summary" />
            </Tabs>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit Log</DialogTitle>
                <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit Production Log</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            fullWidth label="Date" type="date" sx={{ mb: 2 }}
                            value={currentLog?.production_date || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, production_date: e.target.value })}
                           
                        />
                        <TextField
                            select fullWidth label="Machine" sx={{ mb: 2 }}
                            value={currentLog?.machine_name || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, machine_name: e.target.value })}
                        >
                            {machines.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>
                        <TextField
                            select fullWidth label="Operator" sx={{ mb: 2 }}
                            value={currentLog?.operator_name || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, operator_name: e.target.value })}
                        >
                            {operators.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                        <TextField
                            fullWidth label="Product" sx={{ mb: 2 }}
                            value={currentLog?.product_name || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, product_name: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Qty" type="number" sx={{ mb: 2 }}
                            value={currentLog?.produced_qty || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, produced_qty: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Waste" type="number"
                            value={currentLog?.waste_qty || ''}
                            onChange={(e) => setCurrentLog({ ...currentLog, waste_qty: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
                    </DialogActions>
                </Dialog>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {tabValue === 0 && (
                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid><TextField label="Date" type="date" sx={{ width: '200px' }} value={formData.production_date} onChange={(e) => setFormData({ ...formData, production_date: e.target.value })} /></Grid>
                        <Grid><TextField select label="Machine" sx={{ width: '200px' }} value={formData.machine_name} onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}>{machines.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
                        <Grid><TextField select label="Operator" sx={{ width: '200px' }} value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}>{operators.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</TextField></Grid>
                        <Grid><TextField label="Product" sx={{ width: '200px' }} value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} /></Grid>
                        <Grid><TextField label="Qty" type="number" sx={{ width: '200px' }} value={formData.produced_qty} onChange={(e) => setFormData({ ...formData, produced_qty: e.target.value })} /></Grid>
                        <Grid><TextField label="Waste" type="number" sx={{ width: '200px' }} value={formData.waste_qty} onChange={(e) => setFormData({ ...formData, waste_qty: e.target.value })} /></Grid>
                        <Grid><Button variant="contained" sx={{ width: '200px', height: '56px' }} onClick={handleSave}>Save Log</Button></Grid>
                    </Grid>
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Select Machine</InputLabel>
                            <Select value={selectedMachine} label="Select Machine" onChange={(e) => setSelectedMachine(e.target.value)}>
                                <MenuItem value="All">All Machines</MenuItem>
                                {machines.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" onClick={exportToExcel}>Export to Excel</Button>
                    </Box>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell><TableCell>Machine</TableCell><TableCell>Product</TableCell><TableCell>Qty</TableCell><TableCell>Waste</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log, i) => (
                                <TableRow key={log.id || i}>
                                    <TableCell>{log.production_date}</TableCell>
                                    <TableCell>{log.machine_name}</TableCell>
                                    <TableCell>{log.product_name}</TableCell>
                                    <TableCell>{log.produced_qty}</TableCell>
                                    <TableCell>{log.waste_qty}</TableCell>

                                    {/* இங்கேதான் 'log' சரியாகத் தெரியும் */}
                                    <TableCell>
                                        <IconButton onClick={() => { setCurrentLog(log); setEditOpen(true); }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(log.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination component="div" count={filteredLogs.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} />

                    <Table sx={{ mt: 5 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><b>Machine Name</b></TableCell>
                                <TableCell><b>Total Production (kg)</b></TableCell>
                                <TableCell><b>Total Waste (kg)</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summaryData.summary.map((row) => (
                                <TableRow key={row.machine}>
                                    <TableCell>{row.machine}</TableCell>
                                    <TableCell>{row.totalQty} kg</TableCell>
                                    <TableCell>{row.totalWaste} kg</TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                                <TableCell><b>GRAND TOTAL</b></TableCell>
                                <TableCell><b>{summaryData.grandTotalQty} kg</b></TableCell>
                                <TableCell><b>{summaryData.grandTotalWaste} kg</b></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <TablePagination component="div" count={filteredLogs.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} />
                </Paper>
            )}
        </Box>
    );
};