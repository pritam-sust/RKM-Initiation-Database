import { z } from 'zod';

export const personSchema = z.object({
  unique_id: z.string().trim().min(1, 'Initiation Number is required'),
  name: z.string().trim().min(1, 'Name is required'),
  father_or_spouse_name: z.string().trim().optional().nullable(),
  age: z.string().trim().optional().nullable(),
  address: z.string().trim().min(1, 'Address is required'),
  mobile_number: z.string().trim().optional().nullable(),
  occupation: z.string().trim().optional().nullable(),
  education: z.string().trim().optional().nullable(),
  diksha_date: z.string().trim().optional().nullable(),
  diksha_guru: z.string().trim().optional().nullable(),
  diksha_venue: z.string().trim().optional().nullable(),
  diksha_ceremony_serial: z.string().trim().optional().nullable(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const bulkImportSchema = z.object({
  records: z.array(
    z.object({
      unique_id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      father_or_spouse_name: z.string().trim().optional().nullable(),
      age: z.string().trim().optional().nullable(),
      address: z.string().trim().min(1),
      mobile_number: z.string().trim().optional().nullable(),
      occupation: z.string().trim().optional().nullable(),
      education: z.string().trim().optional().nullable(),
      diksha_date: z.string().trim().optional().nullable(),
      diksha_guru: z.string().trim().optional().nullable(),
      diksha_venue: z.string().trim().optional().nullable(),
      diksha_ceremony_serial: z.string().trim().optional().nullable(),
    })
  ).min(1, 'At least one record must be selected for import'),
});

export type PersonInput = z.infer<typeof personSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
