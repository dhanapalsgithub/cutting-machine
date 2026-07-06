import { Pool } from 'pg';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// .env கோப்பை லோட் செய்யவும்
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// கிளவுட் டேட்டாபேஸ் (Neon.tech) கனெக்ஷன்
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // கிளவுட் கனெக்ஷனுக்கு இது கட்டாயம்
  }
});

// டேட்டாபேஸ் கனெக்ஷன் சரிபார்ப்பு
pool.connect()
  .then(() => console.log("Connected to Cloud Database successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// --- API ROUTES ---

// 1. Inventory Routes
app.get('/api/inventory', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.inventory ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

app.post('/api/inventory', async (req: Request, res: Response) => {
  try {
    const { date, name, category, hsn, price, qty, expiry } = req.body;
    const query = "INSERT INTO public.inventory (date, name, category, hsn, qty, price, expiry) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *";
    const newStock = await pool.query(query, [date, name, category, hsn, qty, price, expiry]);
    res.status(201).json(newStock.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/inventory/:id', async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM public.inventory WHERE id = $1", [req.params.id]);
    res.status(200).send("Stock deleted");
  } catch (err: any) { res.status(500).send(err.message); }
});

// 2. Staff Routes
app.post('/api/staff', async (req: Request, res: Response) => {
  const { name, role, phone, salary } = req.body;
  try {
    await pool.query('INSERT INTO public.staff_list (staff_name, role, phone_number, monthly_salary) VALUES ($1, $2, $3, $4)', [name, role, phone, salary]);
    res.status(201).send('Staff added');
  } catch (err: any) { res.status(500).send(err.message); }
});

app.get('/api/staff', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.staff_list ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

// 3. Attendance Routes
app.post('/api/staff_attendance', async (req: Request, res: Response) => {
  const { name, date, status } = req.body;
  try {
    await pool.query('INSERT INTO public.staff_attendance (staff_name, attendance_date, status) VALUES ($1, $2, $3)', [name, date, status]);
    res.status(201).json({ message: 'Attendance marked' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/attendance_log', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.staff_attendance ORDER BY attendance_date DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

// 4. Production Log
app.post('/api/production_log', async (req: Request, res: Response) => {
  const { production_date, machine_name, operator_name, product_name, produced_qty, waste_qty } = req.body;
  try {
    const query = `INSERT INTO public.production_log (production_date, product_name, produced_qty, waste_qty, machine_name, operator_name) VALUES ($1, $2, $3, $4, $5, $6)`;
    await pool.query(query, [production_date, product_name, produced_qty, waste_qty, machine_name, operator_name]);
    res.status(201).send('Log added');
  } catch (err: any) { res.status(500).send(err.message); }
});

app.get('/api/production_log', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.production_log ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

// 5. Purchase Entry
app.post('/api/purchase_entry', async (req, res) => {
  const { supplier_name, bill_no, product_name, qty, unit_price, total_amount, purchase_date, notes } = req.body;
  try {
    const query = `INSERT INTO public.purchase_entry (supplier_name, bill_no, product_name, qty, unit_price, total_amount, purchase_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    await pool.query(query, [supplier_name, bill_no, product_name, qty, unit_price, total_amount, purchase_date, notes]);
    res.status(201).json({ message: 'Success' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 6. Expenses
app.post('/api/expenses', async (req, res) => {
  const { category, description, amount, expense_date } = req.body;
  try {
    await pool.query(`INSERT INTO public.expenses (amount, expense_date, category, description) VALUES ($1, $2, $3, $4)`, [amount, expense_date, category, description]);
    res.status(201).json({ message: 'Success' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.expenses ORDER BY expense_date DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: 'Error' }); }
});

// 7. Dashboard Summary
app.get('/api/dashboard/summary', async (req, res) => {
  const { month, year } = req.query;
  const query = `
    SELECT 
      (SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_entry WHERE EXTRACT(MONTH FROM purchase_date) = $1 AND EXTRACT(YEAR FROM purchase_date) = $2) as purchase,
      (SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE EXTRACT(MONTH FROM expense_date) = $1 AND EXTRACT(YEAR FROM expense_date) = $2) as expenses
  `;
  try {
    const result = await pool.query(query, [month, year]);
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));