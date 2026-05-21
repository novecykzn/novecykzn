import { z } from "zod";

export const applicationRoleSchema = z.enum([
  "doctor",
  "pharmacist",
  "clinic",
  "pharmacy",
  "other",
]);

export const applicationFormSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name."),
  company_name: z.string().min(2, "Practice or company name is required."),
  role: applicationRoleSchema,
  registration_number: z
    .string()
    .min(3, "Registration number is required (HPCSA, SAPC, or practice)."),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(8, "Phone number is required."),
  address: z.string().min(5, "Street address is required."),
  city: z.string().min(2, "City is required."),
  province: z.string().min(2, "Province is required."),
  notes: z.string().max(5000).optional().or(z.literal("")),
  consent: z
    .boolean()
    .refine((v) => v === true, {
      message: "You must confirm you are authorised to submit this application.",
    }),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
