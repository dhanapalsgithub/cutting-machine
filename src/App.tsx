import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material';
import { theme } from './theme';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { Billing } from './components/pages/Billing';
import { Inventory } from './components/pages/Inventory';
import { StaffAttendance } from './components/pages/StaffAttendance';
import { DeliveryChallan } from './components/pages/DeliveryChallan';
import { PurchaseEntry } from './components/pages/PurchaseEntry';
import { Report } from './components/pages/Report';
import { CCTVSurvey } from './components/pages/CCTVSurvey';
import { Expense } from './components/Expense';
import { ProductionLog } from './components/pages/ProductionLog';
import { AttendanceLog } from './components/pages/AttendanceLog';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // App.tsx-ல் மாற்றங்கள்:
  const handleLoginSuccess = (role: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role); // ரோலைச் சேமிக்கவும்
  };
  // 'logout' பங்க்ஷனை Sidebar-க்கு பாஸ் செய்யப் பயன்படுத்தலாம், 
  // இப்போதைக்கு வார்னிங் வராமல் இருக்க export செய்யத் தேவையில்லை என்றால் விட்டுவிடலாம்.
  const logout = () => {
    localStorage.setItem('isAuthenticated', 'false');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          {isAuthenticated && <Sidebar logout={logout} />} {/* Sidebar-ல் logout பங்க்ஷனை அனுப்பவும் */}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: isAuthenticated ? `calc(100% - 240px)` : '100%' },
              ml: { md: isAuthenticated ? '240px' : '0px' }
            }}
          >
            {isAuthenticated && <Toolbar />}

            <Routes>
              {/* பயனர் லாகின் செய்திருந்தால், '/' சென்றாலும் தானாகவே '/dashboard' க்குச் செல்லும் */}
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />}
              />

              <Route
                path="/dashboard"
                element={
                  isAuthenticated && localStorage.getItem('userRole') === 'manager'
                    ? <Dashboard />
                    : <Navigate to="/staff-attendance" />
                }
              />
              <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/" />} />
              <Route path="/production" element={isAuthenticated ? <ProductionLog /> : <Navigate to="/" />} />
              <Route path="/billing" element={isAuthenticated ? <Billing /> : <Navigate to="/" />} />
              <Route path="/staff-attendance" element={isAuthenticated ? <StaffAttendance /> : <Navigate to="/" />} />
              <Route path="/attendance_log" element={isAuthenticated ? <AttendanceLog /> : <Navigate to="/" />} />
              <Route path="/cctv" element={isAuthenticated ? <CCTVSurvey /> : <Navigate to="/" />} />
              <Route path="/purchase-entry" element={isAuthenticated ? <PurchaseEntry /> : <Navigate to="/" />} />
              <Route path="/delivery-challan" element={isAuthenticated ? <DeliveryChallan /> : <Navigate to="/" />} />
              <Route path="/reports" element={isAuthenticated ? <Report /> : <Navigate to="/" />} />
              <Route path="/expense" element={isAuthenticated ? <Expense /> : <Navigate to="/" />} />
               
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;