import { z } from 'zod';

export const personSchema = z.object({
  unique_id: z.string().trim().min(1, 'Unique ID is required'),
  name: z.string().trim().min(1, 'Name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  diksha_date: z.string().trim().optional().nullable(),
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
      address: z.string().trim().min(1),
      diksha_date: z.string().trim().optional().nullable(),
    })
  ).min(1, 'At least one record must be selected for import'),
});

export type PersonInput = z.infer<typeof personSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
