import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.js';
import organizationsRouter from './routes/organizations.js';
import employeesRouter from './routes/employees.js';
import departmentsRouter from './routes/departments.js';
import payrollRouter from './routes/payroll.js';
import adminRouter from './routes/admin.js';
import psychometricTestsRouter from './routes/psychometric-tests.js';
import observationsRouter from './routes/observations.js';
import interviewsRouter from './routes/interviews.js';
import vacationsRouter from './routes/vacations.js';
import attendanceRouter from './routes/attendance.js';
import trainingRouter from './routes/training.js';
import developmentPlansRouter from './routes/development-plans.js';
import jobAnalysisRouter from './routes/job-analysis.js';
import dianRouter from './routes/dian.js';
import evaluationsRouter from './routes/evaluations.js';
import competenciesRouter from './routes/competencies.js';
import benefitsRouter from './routes/benefits.js';
import disciplinaryRouter from './routes/disciplinary.js';
const app = express();
const prisma = new PrismaClient();
// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
}));
app.use(express.json());
app.use(morgan('dev'));
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'competencias-backend' });
});
const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'Competency Manager API', version: '0.1.0' },
        servers: [{ url: '/api' }],
    },
    apis: ['./src/routes/*.ts'],
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/admin', adminRouter);
app.use('/api/psychometric-tests', psychometricTestsRouter);
app.use('/api/observations', observationsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/vacations', vacationsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/training', trainingRouter);
app.use('/api/development-plans', developmentPlansRouter);
app.use('/api/job-analysis', jobAnalysisRouter);
app.use('/api/dian', dianRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/competencies', competenciesRouter);
app.use('/api/benefits', benefitsRouter);
app.use('/api/disciplinary', disciplinaryRouter);
const PORT = Number(process.env.PORT || 4000);
const server = app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port or stop the process using this port.`);
        process.exit(1);
    }
    else {
        console.error('Server error:', err);
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        prisma.$disconnect();
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        prisma.$disconnect();
    });
});
