export class DianSimulator {
    static async submitPayroll(payrollId) {
        return {
            status: 'approved',
            reference: `DIAN-${Date.now()}`,
            response: 'Nómina procesada exitosamente'
        };
    }
    static getDianRequirements() {
        return {
            minSalary: 1300000,
            maxDeductions: 0.25,
            requiredFields: ['employeeId', 'period', 'baseSalary']
        };
    }
}
export class DianValidator {
    static validatePayrollData(payroll) {
        const errors = [];
        if (!payroll.baseSalary || payroll.baseSalary < 1300000) {
            errors.push('Salario base debe ser mayor al mínimo legal');
        }
        if (payroll.deductions > payroll.baseSalary * 0.25) {
            errors.push('Deducciones no pueden exceder el 25% del salario');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static generateXML(data) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Nomina>
  <Empleado>
    <Documento>${data.employeeDocument}</Documento>
    <Nombre>${data.employeeName}</Nombre>
  </Empleado>
  <Periodo>${data.period}</Periodo>
  <SalarioBase>${data.baseSalary}</SalarioBase>
  <SalarioNeto>${data.netSalary}</SalarioNeto>
</Nomina>`;
    }
}
export const dianService = new DianSimulator();
