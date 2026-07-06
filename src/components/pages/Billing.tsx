import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableHead, MenuItem, TableRow, Grid, Paper } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import '../billing.css';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';

export const Billing = () => {
  const [items, setItems] = useState<any[]>([]);
  const [billingAddr, setBillingAddr] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [formData, setFormData] = useState({ desc: '', hsn: '', qty: '', rate: '' });
  const [customerProducts, setCustomerProducts] = useState<any[]>([]);
  const [allBills, setAllBills] = useState<any[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const custRes = await axios.get('http://localhost:5000/api/customers');
        setCustomers(custRes.data);
        const billRes = await axios.get('http://localhost:5000/api/billings_items');
        setAllBills(billRes.data.map((bill: any, index: number) => ({ ...bill, id: index })));
      } catch (err) { console.error("Error loading data", err); }
    };
    loadData();
  }, []);

  const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(allBills);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
    XLSX.writeFile(workbook, "Bill_History.xlsx");
  };

 const columns: GridColDef[] = [
  { field: 'customer_name', headerName: 'Customer Name', flex: 1 }, // flex: 1 என்பது அகலத்தை ஆட்டோமேட்டிக்காக அட்ஜஸ்ட் செய்யும்
  { field: 'billing_address', headerName: 'Address', flex: 1.5 },
  { field: 'amount', headerName: 'Total Amount', type: 'number', width: 150 },
];

  const handleCustomerChange = (e: any) => {
    const selectedName = e.target.value;
    setSelectedCustomerName(selectedName);
    const relatedProducts = customers.filter(c => c.customer_name === selectedName);
    setCustomerProducts(relatedProducts);
    const cust = relatedProducts[0];
    setBillingAddr(cust ? cust.address : '');
    if (cust) {
      setFormData({ desc: cust.product_name, hsn: cust.hsn, qty: '1', rate: cust.price });
    }
  };

  const addItem = () => {
    const qty = parseFloat(formData.qty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const amount = qty * rate;
    setItems([...items, { product_name: formData.desc, hsn_code: formData.hsn, quantity: qty, rate, amount }]);
    setFormData({ desc: '', hsn: '', qty: '', rate: '' });
  };

  const handleSaveBill = async () => {
    try {
      const payload = { customer_name: selectedCustomerName, billing_address: billingAddr, items: items.map(item => ({ ...item, customer_name: selectedCustomerName, billing_address: billingAddr })) };
      await axios.post('http://localhost:5000/api/billings_items', payload);
      alert("Bill Saved!");
      setItems([]);
    } catch (err) { alert("Error saving bill!"); }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <Box sx={{ p: 3 }}>
        <Box className="no-print">
          <Typography variant="h4" sx={{ mb: 3 }}>Invoice Management</Typography>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid><TextField select fullWidth label="Select Customer" value={selectedCustomerName} onChange={handleCustomerChange}>{Array.from(new Set(customers.map(c => c.customer_name))).map((name, index) => (<MenuItem key={index} value={name}>{name}</MenuItem>))}</TextField></Grid>
              <Grid><TextField label="Billing Address" fullWidth multiline rows={2} value={billingAddr} onChange={(e) => setBillingAddr(e.target.value)} /></Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField select label="Product Name" sx={{ width: '200px' }} value={formData.desc} onChange={(e) => { const p = customerProducts.find(item => item.product_name === e.target.value); setFormData({ ...formData, desc: e.target.value, hsn: p?.hsn || '', rate: p?.price || '' }); }}>{customerProducts.map((p, i) => <MenuItem key={i} value={p.product_name}>{p.product_name}</MenuItem>)}</TextField>
              <TextField label="HSN" value={formData.hsn} onChange={(e) => setFormData({ ...formData, hsn: e.target.value })} />
              <TextField label="Qty" type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              <TextField label="Rate" type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} />
              <Button variant="contained" onClick={addItem}>Add Item</Button>
            </Box>
          </Paper>
          <Button variant="contained" color="secondary" onClick={handleSaveBill} sx={{ mr: 2 }}>Save Bill</Button>
          <Button variant="outlined" onClick={() => handlePrint()}>Print Invoice</Button>
        </Box>

        <div ref={componentRef} className="print-container">
          {['ORIGINAL', 'DUPLICATE', 'TRIPLICATE'].map((copyType) => (
            <div key={copyType} className="invoice-page">
              <Typography variant="h6" align="right">{copyType} COPY</Typography>
              <Typography variant="h4" align="center">RAPID TECH INDUSTRIES</Typography>
              <Typography>Customer: {selectedCustomerName}</Typography>
              <Table className="invoice-table">
                <TableHead><TableRow><TableCell>Product</TableCell><TableCell>HSN</TableCell><TableCell>Qty</TableCell><TableCell>Rate</TableCell><TableCell>Amount</TableCell></TableRow></TableHead>
                <TableBody>
                  {items.map((item, i) => (<TableRow key={i}><TableCell>{item.product_name}</TableCell><TableCell>{item.hsn_code}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.rate}</TableCell><TableCell>{item.amount.toFixed(2)}</TableCell></TableRow>))}
                  <TableRow><TableCell colSpan={2}><b>TOTAL</b></TableCell><TableCell><b>{totalQty}</b></TableCell><TableCell></TableCell><TableCell><b>{totalAmount.toFixed(2)}</b></TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        <Box className="no-print" sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Bill History</Typography>
          <Button variant="contained" onClick={exportToExcel} sx={{ mb: 2 }}>Export to Excel</Button>
          <div className="data-grid-container">
            <DataGrid
              rows={allBills}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 }
                }
              }}
              pageSizeOptions={[5, 10, 20]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </div>
        </Box>
      </Box> {/* இந்த </Box> விடுபட்டிருந்தது */}
    </LocalizationProvider>
  );
};