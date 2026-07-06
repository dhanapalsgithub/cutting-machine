import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const DeliveryChallan = () => {
  const [formData, setFormData] = useState({
    clientName: '', vehicleNumber: '', productDescription: '', amount: '', fromAddress: '', toAddress: '', ewayBillNo: ''
  });

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [filterDate, setFilterDate] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // தரவுகளை Backend-ல் இருந்து பெற
  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery_challan');
      const result = await res.json();
      console.log("Backend Data:", result); // இதை கவனியுங்கள்!
      setData(result);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredData = data.filter((row: any) => {
    if (!filterDate) return true;
    // தேதியை மட்டும் பிரித்தெடுத்து ஒப்பிடவும்
    const dateStr = row.delivery_date ? row.delivery_date.substring(0, 7) : "";
    return dateStr === filterDate;
  });
 // இப்படி மாற்றவும் (row: any என்று சேர்க்கவும்)
const generatePDF = (row: any) => { 
  const doc = new jsPDF();
  
  // PDF உள்ளடக்கங்கள்
  doc.setFontSize(20);
  doc.text("Delivery Challan", 75, 20);
  
  doc.setFontSize(12);
  doc.text(`Client: ${row.customer_name}`, 20, 40);
  doc.text(`Vehicle: ${row.vehicle_no}`, 20, 50);
  doc.text(`Challan No: ${row.challan_no}`, 120, 40);
  
  autoTable(doc, { 
    head: [['Description', 'Amount (₹)']], 
    body: [[row.product_description, row.amount]], 
    startY: 100 
  });
  
  doc.save(`challan_${row.challan_no}.pdf`);
};

  const saveToDatabase = async () => {
    const payload = {
      challan_no: formData.ewayBillNo, customer_name: formData.clientName,
      delivery_date: new Date().toISOString().split('T')[0], status: 'Draft',
      vehicle_no: formData.vehicleNumber, eway_bill_no: formData.ewayBillNo,
      from_address: formData.fromAddress, to_address: formData.toAddress,
      product_description: formData.productDescription, amount: parseFloat(formData.amount) || 0
    };

    const response = await fetch('http://localhost:5000/api/delivery_challan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Draft saved successfully!");
      fetchRecords(); // டேட்டாவை ரீஃப்ரெஷ் செய்ய
    } else {
      alert("Error saving draft");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Generate Delivery Challan</Typography>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="clientName" label="Client Name" value={formData.clientName} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="vehicleNumber" label="Vehicle Number" value={formData.vehicleNumber} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="ewayBillNo" label="E-way Bill Number" value={formData.ewayBillNo} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="amount" label="Amount (₹)" type="number" value={formData.amount} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="fromAddress" label="From Address" multiline rows={2} value={formData.fromAddress} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="toAddress" label="To Address" multiline rows={2} value={formData.toAddress} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth name="productDescription" label="Product Description" multiline rows={2} value={formData.productDescription} onChange={handleChange} /></Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" size="large" onClick={generatePDF}>Generate DC PDF</Button>
          <Button variant="outlined" color="secondary" size="large" onClick={saveToDatabase}>Save as Draft</Button>
        </Stack>
      </Paper>

      {/* Record List */}
      <Paper sx={{ mt: 5, p: 3 }}>
        <Typography variant="h6">Records</Typography>
        <TextField type="month" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} sx={{ my: 2 }} />
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>Challan No</TableCell><TableCell>Client</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
            <TableBody>
              {filteredData.slice(page * 5, page * 5 + 5).map((row: any) => (
                <TableRow key={row.id}><TableCell>{row.challan_no}</TableCell><TableCell>{row.customer_name}</TableCell><TableCell>{row.delivery_date}</TableCell><Button
          variant="contained"
          size="small"
          onClick={() => generatePDF(row)}
        >
          Download
        </Button>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)} // _event என்று மாற்றவும்
          rowsPerPage={5}
          rowsPerPageOptions={[5]} // இது தேவையில்லாத 'Rows per page' மெனுவை மறைக்க உதவும்
        />
      </Paper>
    </Box>
  );
};