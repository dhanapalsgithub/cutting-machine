import { Box, Typography, Paper,  Grid, Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export const Report = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Business Reports
      </Typography>

      {/* 1. Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Monthly Revenue</Typography>
            <Typography variant="h4" color="primary">₹4,50,000</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Sales</Typography>
            <Typography variant="h4" color="primary">120 Units</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Pending Payments</Typography>
            <Typography variant="h4" color="secondary">₹25,000</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. Action Area */}
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Detailed Transaction Report</Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={() => alert("Downloading Report...")}
        >
          Download PDF
        </Button>
      </Paper>
    </Box>
  );
};