import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9800', // உங்கள் ஆரஞ்சு நிறம்
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#ffffff', // மிக மென்மையான சாம்பல் பின்னணி
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16, // இதுதான் அந்த Liquid UI-க்கான வளைந்த ஓரங்கள்
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // பட்டன் டெக்ஸ்ட் பெரிய எழுத்துக்களாக மாறாமல் இருக்க
          borderRadius: 12,      // பட்டன்களுக்கும் வளைந்த ஓரங்கள்
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)', // மென்மையான நிழல் (Soft Shadow)
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12, // உள்ளீட்டுப் பெட்டிகளுக்கும் (Input fields) வளைவு
          },
        },
      },
    },
  },
});