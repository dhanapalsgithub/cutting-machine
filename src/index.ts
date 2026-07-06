import { Pool } from 'pg';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { error } from 'console';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rapid_db',
  password: 'dhana@123',
  port: 5432,
});

// --- POST ROUTES ---

app.post('/api/inventory', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, name, category, hsn, price, qty, expiry } = req.body;

    // டேட்டாபேஸ் காலம் பெயர்கள் சரியாக இருப்பதை உறுதி செய்யவும்
    // Example of the correct query structure
    const query = "INSERT INTO public.inventory (date, name, category, hsn, qty, price, expiry) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *";
    const values = [date, name, category, hsn, qty, price, expiry];

    const newStock = await pool.query(query, values);
    res.status(201).json(newStock.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

// index.ts கோப்பில் இதைச் சேர்க்கவும்
// index.ts கோப்பில்
// 1. பில்லைச் சேமிக்க (POST)
app.post('/api/billings_items', async (req, res) => {
  try {
    // req.body-லிருந்து நேரடியாக மதிப்புகளை எடுக்கவும்
    const { billingAddr, poNo, date, vehicleOption, customVehicle, items } = req.body;

    // Header-ஐச் சேமிக்க
    const invoiceQuery = `
      INSERT INTO public.invoices (billing_address, po_number, invoice_date, vehicle_info) 
      VALUES($1, $2, $3, $4) RETURNING invoice_id
    `;
    const vehicleInfo = vehicleOption === 'Custom' ? customVehicle : vehicleOption;
    const invoiceResult = await pool.query(invoiceQuery, [billingAddr, poNo, date, vehicleInfo]);

    const invoiceId = invoiceResult.rows[0].invoice_id;

    // Items-ஐச் சேமிக்க
    const itemQuery = `
      INSERT INTO public.invoice_items (invoice_id, item_code, description, hsn_code, quantity, rate, amount) 
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `;

    // items என்பது ஒரு Array ஆக இருக்க வேண்டும்
    if (Array.isArray(items)) {
      for (const item of items) {
        await pool.query(itemQuery, [
          invoiceId, item.item_code, item.description, item.hsn_code,
          item.quantity, item.rate, item.amount
        ]);
      }
      res.status(201).json({ message: "Bill saved successfully", invoiceId });
    } else {
      res.status(400).json({ error: "Items must be an array" });
    }

  } catch (err: any) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 1. ஊழியர்களைச் சேர்க்க (POST /api/staff)
app.post('/api/staff', async (req: Request, res: Response) => {
  const { name, role, phone, salary } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.staff_list (staff_name, role, phone_number, monthly_salary) VALUES ($1, $2, $3, $4)',
      [name, role, phone, salary]
    );
    res.status(201).json({ message: 'Staff added successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. வருகையைப் பதிவு செய்ய (POST /api/staff_attendance)
app.post('/api/staff_attendance', async (req: Request, res: Response): Promise<void> => {
  const { name, date, status } = req.body;

  try {
    // ஊழியர் பெயர் இருக்கிறதா எனச் சரிபார்க்கவும்
    const checkStaff = await pool.query(
      'SELECT staff_name FROM public.staff_list WHERE staff_name = $1',
      [name]
    );

    if (checkStaff.rows.length === 0) {
      res.status(404).json({ error: "ஊழியர் பெயர் பட்டியலில் இல்லை!" });
      return;
    }

    // ஏற்கனவே அந்த தேதியில் வருகை பதிவு செய்யப்பட்டுள்ளதா எனச் சரிபார்க்கவும் (தவிர்க்க)
    const checkDuplicate = await pool.query(
      'SELECT id FROM public.staff_attendance WHERE staff_name = $1 AND attendance_date = $2',
      [name, date]
    );

    if (checkDuplicate.rows.length > 0) {
      res.status(400).json({ error: "இந்த தேதிக்கான வருகை ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது!" });
      return;
    }

    // வருகையைப் பதிவு செய்யவும்
    await pool.query(
      'INSERT INTO public.staff_attendance (staff_name, attendance_date, status) VALUES ($1, $2, $3)',
      [name, date, status]
    );

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance_log', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.staff_attendance ORDER BY attendance_date DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

app.get('/api/staff_salary/:name', async (req, res) => {
  const { name } = req.params;
  try {
    // 1. ஊழியர் விவரம் மற்றும் மாத சம்பளம்
    const staff = await pool.query('SELECT * FROM public.staff_list WHERE staff_name = $1', [name]);

    // 2. அந்த ஊழியரின் வருகை நாட்களை எண்ணுதல் (Status 'Present')
    const attendance = await pool.query(
      'SELECT COUNT(*) FROM public.staff_attendance WHERE staff_name = $1 AND status = $2',
      [name, 'Present']
    );

    if (staff.rows.length === 0) return res.status(404).send("Staff not found");

    const daysPresent = parseInt(attendance.rows[0].count);
    const monthlySalary = parseFloat(staff.rows[0].monthly_salary);
    const perDay = monthlySalary / 30;
    const totalSalary = daysPresent * perDay;

    res.json({
      name,
      monthlySalary,
      daysPresent,
      totalSalary: totalSalary.toFixed(2)
    });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// purchase entry
app.post('/api/purchase_entry', async (req, res) => {
  // req.body-லிருந்து அனைத்து தரவுகளையும் எடுக்கவும்
  const {
    supplier_name,
    bill_no,
    product_name,
    qty,
    unit_price,
    total_amount,
    purchase_date,
    notes
  } = req.body;

  try {
    const query = `
      INSERT INTO purchase_entry 
      (supplier_name, bill_no, product_name, qty, unit_price, total_amount, purchase_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    // இப்போது சரியாக 8 மதிப்புகளை வரிசைப்படி அனுப்பவும்
    const values = [
      supplier_name,
      bill_no,
      product_name,
      qty,
      unit_price,
      total_amount,
      purchase_date,
      notes
    ];

    console.log("Inserting values:", values);

    await pool.query(query, values);

    res.status(201).json({ message: 'Success' });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});
// Change 'req' to '_req'
app.get('/api/purchase_entry', async (_req, res) => {
  try {
    // Simple select without ordering by a non-existent column
    const query = 'SELECT * FROM purchase_entry;';
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching purchase entries:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.post('/api/delivery', async (req: Request, res: Response): Promise<void> => {
  const { challan_no, name, date, status } = req.body;
  try {
    await pool.query('INSERT INTO public.delivery_challan (challan_no, customer_name, delivery_date, status) VALUES ($1, $2, $3, $4)', [challan_no, name, date, status]);
    res.status(201).send('Challan created');
  } catch (err: any) { res.status(500).send(err.message); }
});

app.post('/api/expenses', async (req: Request, res: Response): Promise<void> => {
  const { name, amount, date } = req.body;
  try {
    await pool.query('INSERT INTO public.expenses (expense_name, amount, expense_date) VALUES ($1, $2, $3)', [name, amount, date]);
    res.status(201).send('Expense added');
  } catch (err: any) { res.status(500).send(err.message); }
});

// --- STAFF ROUTES (இவற்றை மட்டும் வைத்துக்கொள்ளுங்கள்) ---

// 1. ஊழியர்களைச் சேர்க்க (POST)
app.post('/api/staff', async (req: Request, res: Response): Promise<void> => {
  const { name, role, phone, salary } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.staff_list (staff_name, role, phone_number, monthly_salary) VALUES ($1, $2, $3, $4)',
      [name, role, phone, salary]
    );
    res.status(201).send('Staff added successfully');
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// 2. ஊழியர் பட்டியலைப் பெற (GET)
app.get('/api/staff', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.staff_list ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// 3. வருகையைப் பதிவு செய்ய (POST)
app.post('/api/staff_attendance', async (req: Request, res: Response): Promise<void> => {
  const { name, date, status } = req.body;
  try {
    // உங்கள் டேட்டாபேஸில் உள்ள 'public.staff_attendance' டேபிளைப் பயன்படுத்துகிறது
    await pool.query(
      'INSERT INTO public.staff_attendance (staff_name, attendance_date, status) VALUES ($1, $2, $3)',
      [name, date, status]
    );
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// குறிப்பிட்ட ஊழியரின் வருகை தேதிகளைப் பெற (GET /api/staff_attendance_dates/:name)
app.get('/api/staff_attendance_dates/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const result = await pool.query(
            'SELECT attendance_date FROM public.staff_attendance WHERE staff_name = $1 ORDER BY attendance_date DESC',
            [name]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/production_log', async (req: Request, res: Response): Promise<void> => {
  // Frontend-ல் இருந்து வரும் பெயர்கள்
  const { 
    production_date, 
    machine_name, 
    operator_name, 
    product_name, 
    produced_qty, 
    waste_qty 
  } = req.body;

  try {
    // உங்கள் டேபிள் காலம்களின் பெயர்களுடன் சரியாக மேப் செய்யப்பட்டுள்ளது
    const query = `
      INSERT INTO public.production_log (
        production_date, 
        product_name, 
        produced_qty, 
        waste_qty, 
        machine_name, 
        operator_name
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
      production_date, 
      product_name, 
      Number(produced_qty), 
      Number(waste_qty), 
      machine_name, 
      operator_name
    ];

    await pool.query(query, values);
    res.status(201).send('Log added successfully');
  } catch (err: any) { 
    console.error("Database error:", err);
    res.status(500).send(err.message); 
  }
});
app.post('/api/purchase', async (req: Request, res: Response): Promise<void> => {
  const { date, supplier, name, qty, price, total, bill } = req.body;
  try {
    await pool.query('INSERT INTO public.purchase_entry (purchase_date, supplier_name, product_name, qty, unit_price, total_amount, bill_no) VALUES ($1, $2, $3, $4, $5, $6, $7)', [date, supplier, name, qty, price, total, bill]);
    res.status(201).send('Purchase entry added');
  } catch (err: any) { res.status(500).send(err.message); }
});

app.post('/api/cctv', async (req: Request, res: Response): Promise<void> => {
  const { location, description, action, checkedBy } = req.body;
  try {
    await pool.query('INSERT INTO public.cctv_log (camera_location, issue_description, action_taken, checked_by) VALUES ($1, $2, $3, $4)', [location, description, action, checkedBy]);
    res.status(201).send('CCTV log added');
  } catch (err: any) { res.status(500).send(err.message); }
});

// --- GET ROUTES ---

app.get('/api/inventory', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.inventory ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) { res.status(500).send(err.message); }
});

// மீதமுள்ள அனைத்து GET ரூட்டுகளையும் இதேபோல் மாற்றி அமைக்கவும்
// ஊழியர் பட்டியலைப் பெற (GET)

// ... மற்ற GET ரூட்டுகள் ...

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

// DELETE: ஸ்டாக்கை நீக்க
app.delete('/api/inventory/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM public.inventory WHERE id = $1", [id]);
    res.status(200).send("Stock deleted successfully");
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// PUT: விவரங்களைத் திருத்த
app.put('/api/inventory/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // உங்கள் டேட்டாபேஸ் காலம் பெயர்கள் இவைதானா என்பதை ஒருமுறை சரிபார்க்கவும்
    const { date, name, category, hsn, qty, price, expiry } = req.body;

    const query = `
      UPDATE inventory 
      SET date = $1, 
          name = $2, 
          category = $3, 
          hsn = $4, 
          qty = $5, 
          price = $6, 
          expiry = $7 
      WHERE id = $8
    `;
    
    await pool.query(query, [date, name, category, hsn, qty, price, expiry, id]);
    
    res.status(200).send("Stock updated successfully");
  } catch (err: any) {
    console.error("Update Error:", err); // பிழையைக் கண்டறிய இது உதவும்
    res.status(500).send(err.message);
  }
});

// பில்களின் பட்டியலைப் பெறுவதற்கு:
// index.ts கோப்பில்
app.get('/api/billing_items', async (_req, res) => {
  try {
    // அனைத்து பில் பொருட்களையும் ஒன்றாக எடுக்க
    const result = await pool.query('SELECT * FROM public.invoice_items');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});
// ஒரு குறிப்பிட்ட பில்லின் விவரங்களையும் அதன் பொருட்களையும் (Items) இணைத்து எடுக்க:
app.get('/api/billings_items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // பில் விவரம்
    const bill = await pool.query('SELECT * FROM public.invoices WHERE invoice_id = $1', [id]);

    // அந்த பில்லில் உள்ள பொருட்கள்
    const items = await pool.query('SELECT * FROM public.invoice_items WHERE invoice_id = $1', [id]);

    if (bill.rows.length === 0) return res.status(404).send("Bill not found");

    res.json({ ...bill.rows[0], items: items.rows });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Add this to your index.ts
app.get('/api/production_log', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.production_log ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// delivery challan
app.post('/api/delivery_challan', async (req, res) => {
  const { 
    challan_no, customer_name, delivery_date, status, 
    vehicle_no, eway_bill_no, from_address, to_address, 
    product_description, amount 
  } = req.body;

  try {
    const query = `
      INSERT INTO delivery_challan 
      (challan_no, customer_name, delivery_date, status, vehicle_no, eway_bill_no, from_address, to_address, product_description, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    await pool.query(query, [
      challan_no, customer_name, delivery_date, status, 
      vehicle_no, eway_bill_no, from_address, to_address, 
      product_description, amount
    ]);
    
    res.status(201).json({ message: 'Success' });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

app.get('/api/delivery_challan', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_challan ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
// செலவுகளைச் சேர்க்க (POST)
// POST - புதிய செலவைச் சேர்க்க
// Backend (index.ts)
app.post('/api/expenses', async (req, res) => {
  const { category, description, amount, expense_date } = req.body;
  try {
    // அட்டவணையில் உள்ள அதே காலம்கள் வரிசையில் இருக்க வேண்டும்
    const query = `INSERT INTO expenses (amount, expense_date, category, description) VALUES ($1, $2, $3, $4)`;
    await pool.query(query, [amount, expense_date, category, description]);
    res.status(201).json({ message: 'Success' });
  } catch (err) {
    console.error("Database Error:", err); 
    res.status(500).json({ error: 'Database error' });
  }
});

// GET - செலவுகளைப் பெற
app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add this to index.ts
app.get('/api/staff_salary_calculation/:name', async (req, res) => {
  const { name } = req.params;
  try {
    // 1. Get base salary from staff_list
    const staffResult = await pool.query('SELECT * FROM public.staff_list WHERE staff_name = $1', [name]);
    
    if (staffResult.rows.length === 0) return res.status(404).send("Staff not found");

    const monthlySalary = parseFloat(staffResult.rows[0].monthly_salary || 0);

    // 2. Count 'Present' days
    const attendanceResult = await pool.query(
      "SELECT COUNT(*) FROM public.staff_attendance WHERE staff_name = $1 AND status = 'Present'",
      [name]
    );

    const daysPresent = parseInt(attendanceResult.rows[0].count);
    
    // Calculate: (Monthly Salary / 30) * Days Present
    const perDay = monthlySalary / 30;
    const totalSalary = daysPresent * perDay;

    res.json({
      ...staffResult.rows[0],
      daysPresent,
      totalSalary: totalSalary.toFixed(2)
    });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// GET /api/dashboard?start_date=2026-01-01&end_date=2026-01-31
// Backend API (server.js)
// server.js (API)
app.get('/api/dashboard/summary', async (req, res) => {
    const { month, year } = req.query;

    const query = `
        SELECT 
            (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_entry 
             WHERE EXTRACT(MONTH FROM purchase_date) = $1 AND EXTRACT(YEAR FROM purchase_date) = $2) as purchase,
            (SELECT COALESCE(SUM(amount), 0) FROM billings 
             WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2) as bills,
            (SELECT COALESCE(SUM(total_amount), 0) FROM invoices 
             WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2) as received,
            (SELECT COALESCE(SUM(amount), 0) FROM expenses 
             WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2) as expenses,
            (SELECT COUNT(*) FROM delivery_challan 
             WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2) as dc_count
    `;

    try {
        const result = await pool.query(query, [month, year]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: error });
    }
});

// Backend (Express)
app.delete('/api/production_log/:id', async (req, res) => {
  await pool.query('DELETE FROM public.production_log WHERE id = $1', [req.params.id]);
  res.send('Deleted');
});

app.put('/api/production_log/:id', async (req: Request, res: Response): Promise<void> => {
  const { 
    production_date, 
    machine_name, 
    operator_name, 
    product_name, 
    produced_qty, 
    waste_qty 
  } = req.body;

  try {
    const query = `
      UPDATE public.production_log 
      SET 
        production_date = $1, 
        machine_name = $2, 
        operator_name = $3, 
        product_name = $4, 
        produced_qty = $5, 
        waste_qty = $6 
      WHERE id = $7
    `;

    const values = [
      production_date, 
      machine_name, 
      operator_name, 
      product_name, 
      Number(produced_qty), 
      Number(waste_qty), 
      req.params.id
    ];

    await pool.query(query, values);
    res.status(200).send('Log updated successfully');
  } catch (err: any) { 
    console.error("Database error:", err);
    res.status(500).send(err.message); 
  }
});

app.get('/api/customers', async (_req, res) => {
    try {
        // Use .query() instead of .execute()
        // The result object contains the data in the .rows property
        const result = await pool.query('SELECT * FROM customers');
        
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});