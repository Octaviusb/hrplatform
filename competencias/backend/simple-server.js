import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = 'demo-secret-key';

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, activeOrganizationId: decoded.organizationId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, organizationId: 'demo-org' }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Employees routes
app.get('/api/employees', auth, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true, position: true }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', auth, async (req, res) => {
  try {
    const employee = await prisma.employee.create({
      data: {
        ...req.body,
        organizationId: 'demo-org-id',
        hireDate: new Date(req.body.hireDate),
        status: 'active'
      }
    });
    res.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Competencies routes
app.get('/api/competencies', auth, async (req, res) => {
  try {
    const competencies = await prisma.competency.findMany();
    res.json(competencies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch competencies' });
  }
});

app.post('/api/competencies', auth, async (req, res) => {
  try {
    const competency = await prisma.competency.create({
      data: { ...req.body, organizationId: 'demo-org-id' }
    });
    res.json(competency);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create competency' });
  }
});

// Benefits routes
app.get('/api/benefits', auth, async (req, res) => {
  try {
    const benefits = await prisma.benefit.findMany();
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

app.post('/api/benefits', auth, async (req, res) => {
  try {
    const benefit = await prisma.benefit.create({
      data: { ...req.body, organizationId: 'demo-org-id' }
    });
    res.json(benefit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create benefit' });
  }
});

// Payroll routes
app.get('/api/payroll', auth, async (req, res) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: { employee: true }
    });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
});

app.post('/api/payroll/generate', auth, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({ where: { status: 'active' } });
    let generated = 0;
    
    for (const employee of employees) {
      await prisma.payroll.create({
        data: {
          employeeId: employee.id,
          organizationId: 'demo-org-id',
          period: req.body.period,
          periodStart: new Date(req.body.periodStart),
          periodEnd: new Date(req.body.periodEnd),
          baseSalary: employee.salary || 3000000,
          bonuses: 0,
          deductions: 0,
          netSalary: employee.salary || 3000000,
          status: 'pending'
        }
      });
      generated++;
    }
    
    res.json({ generated, errors: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payroll' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});