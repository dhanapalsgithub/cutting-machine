import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export const Dashboard = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [stats, setStats] = useState({
    purchase: 0,
    bills: 0,
    received: 0,
    expenses: 0,
    delivery_challan: 0, 
  });

  const fetchData = async (selectedDate: Dayjs) => {
    const month = selectedDate.month() + 1;
    const year = selectedDate.year();

    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      
      // API-ல் இருந்து வரும் பெயர்களை உங்கள் state-க்கு சரியாக மாற்றவும்
      setStats({
        purchase: Number(data.purchase) || 0,
        bills: Number(data.bills) || 0,
        received: Number(data.received) || 0,
        expenses: Number(data.expenses) || 0,
        delivery_challan: Number(data.dc_count) || 0,
      });
    } catch (error) {
      console.error("தரவை எடுப்பதில் பிழை:", error);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  // 'cards' இங்கே டிபைன் செய்யப்பட்டுள்ளது, இது அனைத்து stats-ஐயும் பயன்படுத்துகிறது
  const cards = [
    { title: 'Monthly Purchase', value: stats.purchase },
    { title: 'Monthly Bills', value: stats.bills },
    { title: 'Received Payment', value: stats.received },
    { title: 'Monthly Expense', value: stats.expenses },
    { title: 'Monthly DC', value: stats.delivery_challan },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard</Typography>

        <DatePicker
          label="Filter Month/Year"
          views={['month', 'year']}
          value={date}
          onChange={(newDate) => {
            if (newDate) setDate(dayjs(newDate));
          }}
          slotProps={{ textField: { fullWidth: false } }}
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {cards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid rgba(255, 152, 0, 0.1)' }}>
                <Typography variant="subtitle1" color="textSecondary">{card.title}</Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {card.title === 'Monthly DC'
                    ? card.value
                    : `₹${Number(card.value).toLocaleString()}`}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};