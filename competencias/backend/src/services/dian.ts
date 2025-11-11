import type { Prisma } from '@prisma/client';

export interface DianPayload {
  employer: { nit: string; name: string };
  employee: { identification: string; name: string; email: string };
  payroll: {
    period: string;
    periodStart?: Date | string;
    periodEnd?: Date | string;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
  };
}

export interface DianResult {
  success: boolean;
  reference: string | null;
  message: string;
  timestamp: string;
}

export interface PayrollSender {
  send(payload: DianPayload): Promise<DianResult>;
}

class MockSender implements PayrollSender {
  async send(payload: DianPayload): Promise<DianResult> {
    await new Promise((r) => setTimeout(r, 800));
    const success = Math.random() > 0.1;
    return {
      success,
      reference: success ? `DIAN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` : null,
      message: success ? 'Payroll successfully submitted to DIAN (mock)' : 'DIAN submission failed (mock)',
      timestamp: new Date().toISOString(),
    };
  }
}

class PTsender implements PayrollSender {
  async send(payload: DianPayload): Promise<DianResult> {
    const env = process.env.DIAN_ENV || 'sandbox';
    const baseUrl = process.env.DIAN_API_URL;
    const apiKey = process.env.DIAN_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new Error('DIAN provider not configured');
    }
    // NOTE: Placeholder. Here you would format payload as required by PT (e.g., UBL/XML or JSON), sign if needed, and POST
    // For now we just simulate a success response but via the PT path to validate wiring.
    return {
      success: true,
      reference: `PT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      message: `Sent to DIAN PT (${env})`,
      timestamp: new Date().toISOString(),
    };
  }
}

export function getPayrollSender(): PayrollSender {
  const provider = (process.env.DIAN_PROVIDER || 'mock').toLowerCase();
  if (provider === 'pt') return new PTsender();
  return new MockSender();
}
