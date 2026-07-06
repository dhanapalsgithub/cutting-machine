import { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Toolbar, Box, AppBar, IconButton, Button } from '@mui/material'; // Button இம்போர்ட் செய்துள்ளேன்
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout'; // Logout ஐகான்
import logo from '../assets/logo.png';

// logout பங்க்ஷனுக்கான Type definition
interface SidebarProps {
    logout: () => void;
}

const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
      { text: 'Production', path: '/production', icon: <AccountBalanceWalletIcon /> },
    { text: 'Inventory', path: '/inventory', icon: <InventoryIcon /> },
    { text: 'Billing', path: '/billing', icon: <ReceiptIcon /> },
    { text: 'Staff Attendance', path: '/staff-attendance', icon: <PersonIcon /> },
    { text: 'Attendance log', path: '/attendance_log', icon: <AccountBalanceWalletIcon /> },
    { text: 'CCTV', path: '/cctv', icon: <VideocamIcon /> },
    { text: 'Purchase Entry', path: '/purchase-entry', icon: <AddShoppingCartIcon /> },
    { text: 'Delivery Challan', path: '/delivery-challan', icon: <LocalShippingIcon /> },
    { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
    { text: 'Expense', path: '/expense', icon: <AccountBalanceWalletIcon /> },
  
];

export const Sidebar = ({ logout }: SidebarProps) => {
    const userRole = localStorage.getItem('userRole'); // logout prop-ஐப் பெறுகிறது
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const getMenuItems = () => {
        if (userRole === 'employee') {
            return menuItems.filter(item => item.text === 'Staff Attendance');
        }
        return menuItems; // Manager ஆக இருந்தால் அனைத்தும் தெரியும்
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ width: 240, color: '#e65100', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ justifyContent: 'center', p: 2 }}>
                <Box
                    component="img"
                    src={logo}
                    alt="Rapid Tech Logo"
                    sx={{
                        width: '75px',
                        height: '75px',
                        borderRadius: '50%',
                        border: '3px solid #FF9800',
                        padding: '5px',
                        display: 'block',
                        objectFit: 'cover'
                    }}
                />
            </Toolbar>
            <List sx={{ flexGrow: 1 }}>
                {getMenuItems().map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{ color: '#484548' }}
                        >
                            <ListItemIcon sx={{ color: '#e65100' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            
            {/* லாக் அவுட் பட்டன் */}
            <Box sx={{ p: 1 }}>
                <Button 
                    fullWidth 
                    variant="outlined" 
                    color="error" 
                    startIcon={<LogoutIcon />} 
                    onClick={logout}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box component="nav">
            <AppBar position="fixed" sx={{ display: { md: 'none' }, bgcolor: 'transparent', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton onClick={handleDrawerToggle} sx={{ color: '#e65100' }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 240 } }}
            >
                {drawerContent}
            </Drawer>

            <Drawer 
                variant="permanent" 
                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 240 } }} 
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};