import { z } from "zod";

const projectSchema = z.object({
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long")
    .max(100, "Project name must not exceed 100 characters")
    .nonempty("Project name is required"),
  // projectId: z.string().nonempty("Project ID is required."),
  projectAddress: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .max(200, "Address must not exceed 200 characters")
    .nonempty("Project address is required"),
  // typeOfProject: z.enum(["Type1", "Type2", "Type3"], {
  //   errorMap: () => ({
  //     message: "Must be selected from the dropdown",
  //   }),
  // }),
  typeOfProject: z
    .string()
    .min(2, "Business category must be at least 2 characters long")
    .max(50, "Business category must not exceed 50 characters")
    .nonempty("Business category is required"),
  tenureInDays: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val), {
      message: "Tenure must be a valid number",
    })
    .refine((val) => Number.isInteger(val), {
      message: "Tenure must be a whole number",
    })
    .refine((val) => val > 0, {
      message: "Tenure must be greater than 0",
    })
    .refine((val) => val <= 3650, {
      message: "Tenure cannot exceed 10 years (3650 days)",
    }),
  companyId: z
    .number()
    .int()
    .positive("Company ID must be a positive integer"),
  pointOfContact: z
    .array(
      z
        .union([
          z.number().int().positive(),
          z.string().regex(/^\d+$/, "Must select a valid POC"),
        ])
        .transform((value) =>
          typeof value === "string" ? parseInt(value, 10) : value
        )
    )
    .min(1, "At least one point of contact is required")
    .max(10, "Maximum 10 points of contact allowed"),
});

export default projectSchema;
