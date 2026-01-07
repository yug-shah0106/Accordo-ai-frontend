import { z } from "zod";

const companySchema = () =>
  z.object({
    companyName: z.string(),
    phone: z
      .string()
      
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    email: z
      .string()
      
      .email("Please enter a valid email address"),
    establishmentDate: z.string().optional(),
    nature: z.string().optional(),
    type: z.string().optional(),
    numberOfEmployees: z.string().optional(),
    annualTurnover: z.string().optional(),
    industryType: z.string().optional(),
    gstNumber: z.string().optional(),
    gstUrl: z.string().optional(),
    panNumber: z.string().optional(),
    panFileUrl: z.string().optional(),
    msmeNumber: z.string().optional(),
    msmeFileUrl: z.string().optional(),
    ciNumber: z.string().optional(),
    ciFileUrl: z.string().optional(),
    pocName: z.string().optional(),
    pocEmail: z
      .string()
   
      .email("Please enter a valid email address"),
    pocDesignation: z.string().optional(),
    pocPhone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    pocWebsite: z.string().url("Please enter a valid URL"),
    escalationName: z.string().optional(),
    escalationDesignation: z.string().optional(),
    escalationEmail: z
      .string()
     
      .email("Please enter a valid email address"),
    escalationPhone: z
      .string()
   
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    typeOfCurrency: z.string().optional(),
    bankName: z.string().optional(),
    beneficiaryName: z.string().optional(),
    accountNumber: z.string().optional(),
    iBanNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    bankAccountType: z.string().optional(),
    cancelledCheque: z.string().optional(),
    cancelledChequeURL: z.string().optional(),
    ifscCode: z.string().optional(),
    fullAddress: z.string().optional(),
    profilePic: z
          .any()
          .refine((file) => file?.[0]?.size > 0, "Profile photo is required.")
          .refine((file) => file?.[0], "Profile photo is required."),
  });

export default companySchema;
