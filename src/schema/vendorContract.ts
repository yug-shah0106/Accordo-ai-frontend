import { z } from "zod";

export const step2 = z.object({
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: "Total Price must be a positive integer",
    }),
  deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid delivery date format",
  }),
  paymentTerms: z.string().optional(),
});
