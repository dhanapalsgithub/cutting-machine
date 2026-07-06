import React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Stack } from '@mui/material';

export const PurchaseEntry = () => {
  const [formData, setFormData] = useState({
    vendorName: '',
    invoiceNumber: '',
    itemName: '',
    quantity: '',
    unitPrice: '',
    notes: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [_purchases, setPurchases] = useState([]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchase_entry');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      supplier_name: formData.vendorName,
      bill_no: formData.invoiceNumber,
      product_name: formData.itemName,
      qty: parseInt(formData.quantity) || 0,
      unit_price: parseFloat(formData.unitPrice) || 0,
      total_amount: (parseInt(formData.quantity) || 0) * (parseFloat(formData.unitPrice) || 0),
      purchase_date: formData.purchaseDate,
      notes: formData.notes
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch('/api/purchase_entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        alert("Purchase saved successfully!");
        // Optionally refresh the list or clear form here
      } else {
        console.error("Failed to save");
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        New Purchase Entry
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="vendorName" label="Vendor/Supplier Name" value={formData.vendorName} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="purchaseDate"
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="invoiceNumber" label="Invoice Number" value={formData.invoiceNumber} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="itemName" label="Item Name" value={formData.itemName} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth name="quantity" label="Quantity" type="number" value={formData.quantity} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth name="unitPrice" label="Unit Price (₹)" type="number" value={formData.unitPrice} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth name="notes" label="Notes / Description" multiline rows={2} value={formData.notes} onChange={handleChange} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" size="large" onClick={handleSave}>
            Save Purchase
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => setFormData({
              vendorName: '',
              invoiceNumber: '',
              itemName: '',
              quantity: '',
              unitPrice: '',
              notes: '',
              purchaseDate: new Date().toISOString().split('T')[0]
            })}
          >
            Clear
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};