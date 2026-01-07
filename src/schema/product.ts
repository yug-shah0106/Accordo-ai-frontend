import { z } from "zod";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  
  brandName: z.string().min(1, "Brand name is required"),
  gstType: z.enum(["GST", "Non-Gst"]),
  gstPercentage: z.any().optional(),
  tds: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: "Tds must be a positive integer",
    }),
  type: z.enum(["Goods", "Services"]),
  UOM: z.string().min(1, "UMO is required"),
}).refine((data) => {
  if (data.gstType === "GST" && !data.gstPercentage) {
    return false;
  }
  return true;
}, {
  message: "GST gstPercentage are required when GST Type is GST",
  path: ["gstPercentage"], 
});

export default productSchema;
