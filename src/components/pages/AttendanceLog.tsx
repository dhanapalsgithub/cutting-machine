import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import logo from '../../assets/logo.png'; 
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export const AttendanceLog = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmp,setSelectedEmp ] = useState<any>(null);
    const [attendanceDates, setAttendanceDates] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const slipRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/staff');
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

   // Inside AttendanceLog component
const handleStaffSelect = async (name: string) => {
    try {
        // Fetch calculated salary data
        const res = await fetch(`http://localhost:5000/api/staff_salary_calculation/${name}`);
        const data = await res.json();
        
        // This will update the state with everything needed for the slip
        // Note: You need to add `setSelectedEmp(data)` logic
        // If you don't have setSelectedEmp state, add it:
        // const [selectedEmp, setSelectedEmp] = useState<any>(null);
        setSelectedEmp(data); 

        // Fetch just the dates for the table at the bottom
        const resDates = await fetch(`http://localhost:5000/api/staff_attendance_dates/${name}`);
        const dataDates = await resDates.json();
        setAttendanceDates(dataDates);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

    const handlePrint = useReactToPrint({ contentRef: slipRef });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Salary Slip & Attendance</Typography>

            {/* DatePicker இப்போது சரியான இடத்தில் உள்ளது */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Select Month/Year"
                    views={['month', 'year']}
                    value={selectedDate}
                    onChange={(newValue: any) => setSelectedDate(newValue)}
                    slotProps={{ textField: { sx: { mb: 2, display: 'block' } } }}
                />
            </LocalizationProvider>

            <FormControl sx={{ minWidth: 250, mb: 3 }}>
                <InputLabel>Select Staff</InputLabel>
                <Select onChange={(e) => handleStaffSelect(e.target.value as string)} value={selectedEmp?.staff_name || ''}>
                    {employees.map(emp => (
                        <MenuItem key={emp.id} value={emp.staff_name}>{emp.staff_name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedEmp && (
                <>
                    <Button variant="contained" color="primary" onClick={handlePrint} sx={{ ml: 2 }}>Print Salary Slip</Button>

                    <Box ref={slipRef} sx={{ p: 4, mt: 3, border: '2px solid #000', maxWidth: '700px', bgcolor: 'white', mx: 'auto' }}>
                        {/* Header Section */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Box
                                component="img"
                                src={logo}
                                alt="Company Logo"
                                sx={{ width: '100px', height: 'auto', mb: '10px' }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>RAPID TECH INDUSTRIES</Typography>
                            <Typography variant="body2">
                                NO47/1, Akkamapuram maid road, Akkamapuram Village, Sriperumbudur, Tamilnadu 631553.
                            </Typography>
                        </Box>

                        <Divider sx={{ borderBottomWidth: 2, borderColor: 'black' }} />
                        <Typography variant="h6" align="center" sx={{ my: 1 }}>
                            Payslip for the month {selectedDate.format('MMM YYYY')}
                        </Typography>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #ccc', mb: 2 }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell><b>Employee Name:</b> {selectedEmp.staff_name}</TableCell>
                                        <TableCell><b>Salary Period:</b> {selectedDate.format('MMM YYYY')}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><b>Designation:</b> {selectedEmp.role}</TableCell>
                                        <TableCell><b>Net Paid Days:</b> {selectedEmp.daysPresent || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><b>Mobile:</b> {selectedEmp.phone_number}</TableCell>
                                        <TableCell><b>Monthly Salary:</b> ₹{selectedEmp.monthlySalary || 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #ccc' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#e0f7fa' }}>
                                    <TableRow>
                                        <TableCell><b>Earnings</b></TableCell>
                                        <TableCell><b>Amount (INR)</b></TableCell>
                                        <TableCell><b>Deductions</b></TableCell>
                                        <TableCell><b>Amount (INR)</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Basic</TableCell>
                                        <TableCell>{selectedEmp.totalSalary || 0}</TableCell>
                                        <TableCell>PF / Tax</TableCell>
                                        <TableCell>0.00</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><b>Total Earnings</b></TableCell>
                                        <TableCell><b>{selectedEmp.totalSalary || 0}</b></TableCell>
                                        <TableCell><b>Total Deductions</b></TableCell>
                                        <TableCell><b>0.00</b></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 2 }}>
                            <Typography><b>Net Payable Amount:</b> ₹{selectedEmp.totalSalary || 0}</Typography>
                        </Box>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Working Days Log:</Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 150, border: '1px solid #ccc' }}>
                            <Table size="small">
                                <TableBody>
                                    {attendanceDates.map((d, index) => (
                                        <TableRow key={index}><TableCell>{d.attendance_date?.split('T')[0]}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}
        </Box>
    );
};