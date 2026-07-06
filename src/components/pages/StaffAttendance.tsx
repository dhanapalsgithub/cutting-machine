import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Edit, Print } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

export const StaffAttendance = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  
  const componentRef = useRef<HTMLDivElement>(null);
  
  // பிரிண்ட் செய்வதற்கான புதிய முறை
  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const userRole = localStorage.getItem('userRole');

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      const data = await response.json();
      setEmployees(data);
    } catch (err) { console.error("Error:", err); }
  };

  const addEmployee = async () => {
    if (!staffName || !role || !phone || !salary) return alert("All fields are required");
    try {
      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: staffName, role, phone, salary: parseFloat(salary) }),
      });
      if (response.ok) {
        alert("Staff added successfully!");
        setStaffName(''); setRole(''); setPhone(''); setSalary('');
        fetchEmployees();
      }
    } catch (err) { alert("Backend connection error"); }
  };

const markAttendance = async () => {
  if (!selectedEmp) return alert("Please select a name");
  
  try {
    const response = await fetch('http://localhost:5000/api/staff_attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: selectedEmp, 
        date: new Date().toISOString().split('T')[0], // இன்றைய தேதி
        status: 'Present' 
      }),
    });

    if (response.ok) {
      alert("Attendance marked successfully!");
    } else {
      const errorData = await response.json();
      alert("Error: " + errorData.error);
    }
  } catch (err) { 
    alert("Backend connection error: Ensure your server is running on port 5000"); 
  }
};
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{userRole === 'manager' ? 'Employee Management' : 'Mark Attendance'}</Typography>

      {userRole === 'manager' && (
        <Stack spacing={2} sx={{ mb: 4, p: 2, border: '1px dashed #e65100', borderRadius: 2 }}>
          <TextField label="Staff Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          <TextField label="Monthly Salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button variant="contained" onClick={addEmployee}>Add Employee</Button>
        </Stack>
      )}

      {userRole !== 'manager' && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Name</InputLabel>
            <Select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              {employees.map(emp => <MenuItem key={emp.id} value={emp.staff_name}>{emp.staff_name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={markAttendance}>Submit Attendance</Button>
        </Stack>
      )}

      <TableContainer component={Paper} ref={componentRef} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Per Day</TableCell>
              {userRole === 'manager' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.staff_name}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>₹{emp.monthly_salary}</TableCell>
                <TableCell>₹{(emp.monthly_salary / 30).toFixed(2)}</TableCell>
                {userRole === 'manager' && (
                  <TableCell>
                    <IconButton><Edit /></IconButton>
                    <IconButton onClick={() => handlePrint()}><Print /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};