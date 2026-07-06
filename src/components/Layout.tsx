import React from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';

// Layout காம்பொனென்ட் logout செயல்பாட்டைப் பெற்று Sidebar-க்கு அனுப்ப வேண்டும்
interface LayoutProps {
  children: React.ReactNode;
  logout: () => void; // இதைச் சேர்க்கவும்
}

const Layout = ({ children, logout }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* இங்கே logout ப்ராப்பை பாஸ் செய்யவும் */}
      <Sidebar logout={logout} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;