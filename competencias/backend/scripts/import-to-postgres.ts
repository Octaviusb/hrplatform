import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

async function main() {
  const sqlitePath = 'prisma/prisma/dev.db';
  const sqlite = new Database(sqlitePath, { readonly: true });
  const prisma = new PrismaClient();

  const tables: Array<{ table: string; accessor: keyof PrismaClient }> = [
    { table: 'Organization', accessor: 'organization' as any },
    { table: 'Department', accessor: 'department' as any },
    { table: 'Position', accessor: 'position' as any },
    { table: 'User', accessor: 'user' as any },
    { table: 'Role', accessor: 'role' as any },
    { table: 'Permission', accessor: 'permission' as any },
    { table: 'RolePermission', accessor: 'rolePermission' as any },
    { table: 'Membership', accessor: 'membership' as any },
    { table: 'UserRole', accessor: 'userRole' as any },
    { table: 'Employee', accessor: 'employee' as any },
    { table: 'PsychometricTest', accessor: 'psychometricTest' as any },
    { table: 'TestQuestion', accessor: 'testQuestion' as any },
    { table: 'TestAssignment', accessor: 'testAssignment' as any },
    { table: 'TestResult', accessor: 'testResult' as any },
    { table: 'TestAnswer', accessor: 'testAnswer' as any },
    { table: 'PersonalityTrait', accessor: 'personalityTrait' as any },
    { table: 'Observation', accessor: 'observation' as any },
    { table: 'Interview', accessor: 'interview' as any },
    { table: 'Vacation', accessor: 'vacation' as any },
    { table: 'Attendance', accessor: 'attendance' as any },
    { table: 'Payroll', accessor: 'payroll' as any },
    { table: 'JobAnalysis', accessor: 'jobAnalysis' as any },
    { table: 'DevelopmentPlan', accessor: 'developmentPlan' as any },
    { table: 'Training', accessor: 'training' as any },
    { table: 'TrainingEnrollment', accessor: 'trainingEnrollment' as any },
    { table: 'PerformanceEvaluation', accessor: 'performanceEvaluation' as any },
    { table: 'EvaluationCriteria', accessor: 'evaluationCriteria' as any },
    { table: 'Competency', accessor: 'competency' as any },
    { table: 'EmployeeCompetency', accessor: 'employeeCompetency' as any },
    { table: 'PositionCompetency', accessor: 'positionCompetency' as any },
    { table: 'Benefit', accessor: 'benefit' as any },
    { table: 'EmployeeBenefit', accessor: 'employeeBenefit' as any },
    { table: 'DisciplinaryCase', accessor: 'disciplinaryCase' as any },
    { table: 'Charge', accessor: 'charge' as any },
    { table: 'Notification', accessor: 'notification' as any },
    { table: 'DefenseSubmission', accessor: 'defenseSubmission' as any },
    { table: 'Hearing', accessor: 'hearing' as any },
    { table: 'Sanction', accessor: 'sanction' as any },
    { table: 'Termination', accessor: 'termination' as any },
    { table: 'Attachment', accessor: 'attachment' as any },
    { table: 'AuditLog', accessor: 'auditLog' as any },
  ];

  const copy = async (table: string, accessor: keyof PrismaClient) => {
    const stmt = sqlite.prepare(`SELECT * FROM "${table}"`);
    const rows = stmt.all();
    if (!rows.length) return;
    // @ts-ignore dynamic access
    const model = prisma[accessor];
    await (model as any).createMany({ data: rows, skipDuplicates: true });
    console.log(`Imported ${rows.length} rows into ${String(accessor)}`);
  };

  // Order matters due to FKs; the array above is ordered roughly by dependencies.
  for (const { table, accessor } of tables) {
    await copy(table, accessor);
  }

  await prisma.$disconnect();
  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
