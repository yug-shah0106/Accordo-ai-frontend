import { z } from "zod";

const productDataSchema = z.array(
  z.object({
    productId: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: "Select Correct Product",
      }),
    qty: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "" ? "" : parseInt(val, 10) || 0;
        }
        return val;
      })
      .refine((val) => val === "" || (Number.isInteger(val) && val > 0), {
        message: "Quantity Must be a positive number",
      }),
    targetPrice: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "" ? "" : parseFloat(val) || 0;
        }
        return val;
      })
      .refine((val) => val === "" || (Number.isFinite(val) && val > 0), {
        message: "Target Price must be a positive number",
      }),
    maximum_price: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "" ? "" : parseFloat(val) || 0;
        }
        return val;
      })
      .refine((val) => val === "" || (Number.isFinite(val) && val >= 0), {
        message: "Maximum Price must be a positive number",
      })
      .optional(),
  })
);

export const step1 = (_tenureInDays?: number | undefined) =>
  z
    .object({
      subject: z.string().min(1, "Subject is required"),

      // category: z
      //   .union([z.string(), z.number()])
      //   .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      //   .refine((val) => Number.isInteger(val) && val > 0, {
      //     message: "Category ID must be a positive integer",
      //   }),
      category: z.string().min(1, "Category is required"),
      deliveryDate: z
        .union([z.string(), z.date()])
        .transform((val) => (typeof val === "string" ? new Date(val) : val))
        .refine((date) => !isNaN(date.getTime()), {
          message: "Invalid delivery date format",
        })
        .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
          message: "Delivery date must be today or in the future",
        }),

      negotiationClosureDate: z
        .union([z.string(), z.date()])
        .transform((val) => (typeof val === "string" ? new Date(val) : val))
        .refine((date) => !isNaN(date.getTime()), {
          message: "Invalid negotiation closure date format",
        }),

      maxDeliveryDate: z
        .union([z.string(), z.date()])
        .transform((val) => (typeof val === "string" ? new Date(val) : val))
        .refine((date) => !isNaN(date.getTime()), {
          message: "Invalid maximum delivery date format",
        })
        .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
          message: "Maximum delivery date must be today or in the future",
        })
        .optional(),

      typeOfCurrency: z.string().min(1, "Type of currency is required"),

      // rfqId: z.string().optional().or(z.literal("")),

      projectId: z.union([
        z.string().min(1, "Project ID must be a non-empty string"),
        z.number().int().positive("Project ID must be a positive integer"),
      ]),
    })
    .refine(
      (data) => data.negotiationClosureDate < data.deliveryDate,
      {
        message: "Negotiation closure date must be before the delivery date",
        path: ["negotiationClosureDate"],
      }
    )
    .refine(
      (data) => !data.maxDeliveryDate || data.maxDeliveryDate > data.deliveryDate,
      {
        message: "Maximum delivery date must be after the delivery date",
        path: ["maxDeliveryDate"],
      }
    );





export const step2 = z.object({
  totalQuantity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val))
    .refine((val) => Number.isInteger(val) && val >= 0, {
      message: "Total Quantity must be a non-negative integer",
    })
    .optional(),

  totalPrice: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val))
    .refine((val) => Number.isFinite(val) && val >= 0, {
      message: "Total Unit Price must be a positive number",
    }),

  totalMaxPrice: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val))
    .refine((val) => Number.isFinite(val) && val >= 0, {
      message: "Total Maximum Acceptable Price must be a positive number",
    })
    .optional(),

  productData: productDataSchema.optional(),
  paymentTerms: z.string().optional(),
  files: z.unknown().optional(),
  
  netPaymentDay: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "" ? "" : parseInt(val, 10) || 0;
      }
      return val;
    })
    .refine((val) => val === "" || (Number.isInteger(val) && val >= 0), {
      message: "Net Payment Day must be at least 0 days",
    })
    .optional(),
  
  prePaymentPercentage: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "" ? "" : parseFloat(val) || 0;
      }
      return val;
    })
    .refine((val) => val === "" || (Number.isFinite(val) && val >= 0 && val <= 100), {
      message: "Pre Payment Percentage must be between 0 and 100",
    })
    .optional(),
  
  postPaymentPercentage: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "" ? "" : parseFloat(val) || 0;
      }
      return val;
    })
    .refine((val) => val === "" || (Number.isFinite(val) && val >= 0 && val <= 100), {
      message: "Post Payment Percentage must be between 0 and 100",
    })
    .optional(),
  
});
