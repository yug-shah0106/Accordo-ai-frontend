import { z } from "zod";

const validGstPercentages = [0, 5, 12, 18, 28] as const;

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(255, "Product name cannot exceed 255 characters"),
  category: z.string().min(1, "Category is required").max(255, "Category cannot exceed 255 characters"),
  brandName: z.string().min(1, "Brand name is required").max(255, "Brand name cannot exceed 255 characters"),
  gstType: z.enum(["GST", "Non-GST"], {
    errorMap: () => ({ message: 'GST type must be either "GST" or "Non-GST"' }),
  }),
  gstPercentage: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return null;
      return typeof val === "string" ? parseInt(val, 10) : val;
    })
    .refine(
      (val) => val === null || validGstPercentages.includes(val as typeof validGstPercentages[number]),
      { message: "GST percentage must be one of: 0, 5, 12, 18, 28" }
    ),
  tds: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: "HSN Code must be a positive number",
    }),
  type: z.enum(["Goods", "Services"], {
    errorMap: () => ({ message: 'Type must be either "Goods" or "Services"' }),
  }),
  UOM: z.enum(["unit", "kg", "liters", "pieces", "box", "pack", "ton", "sheet", "roll", "license"], {
    errorMap: () => ({ message: 'UOM must be one of: "unit", "kg", "liters", "pieces", "box", "pack", "ton", "sheet", "roll", "license"' }),
  }),
}).refine((data) => {
  if (data.gstType === "GST" && (data.gstPercentage === null || data.gstPercentage === undefined)) {
    return false;
  }
  return true;
}, {
  message: "GST percentage is required when GST Type is GST",
  path: ["gstPercentage"],
});

export default productSchema;
