import { useState } from 'react';
import { Box, TextField, Button, Typography, Stack, MenuItem, Select, FormControl, InputLabel, Fade } from '@mui/material';
import logo from '../../assets/logo.png';

export const Login = ({ onLoginSuccess }: { onLoginSuccess: (role: string) => void }) => {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');

  const handleLogin = () => {
    if ((role === 'manager' && password === '1234') || (role === 'employee' && password === '4567')) {
      onLoginSuccess(role);
    } else {
      alert("Invalid Password or Role!");
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative',
      background: '#fffff',
      overflow: 'hidden'
    }}>
      {/* வாட்டர்மார்க் லோகோ மற்றும் டெக்ஸ்ட் */}
      <Box sx={{ 
        position: 'absolute', 
        opacity: 0.1, 
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '200%',
        height: '200%',
        marginBottom:'500px',
      }}>
        <Box component="img" src={logo} alt="Logo" sx={{ width: 300, height: '150' }} />
        
      </Box>

      {/* லாகின் கார்டு */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ 
          maxWidth: 400, 
          width: '100%',
          p: 2, 
          bgcolor: '#ffff', 
          borderRadius: 4, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          zIndex: 1,
          backdropFilter: 'blur(10px)',
          marginTop:'100px'
        }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#e65100', fontWeight: 'bold' }}>
            Secure Access
          </Typography>
          
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            <Button 
              variant="contained" 
              onClick={handleLogin}
              sx={{ 
                py: 1.5, 
                bgcolor: '#e65100', 
                '&:hover': { bgcolor: '#bf360c' },
                transition: 'transform 0.2s',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              Login
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
};