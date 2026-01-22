import { z } from "zod";

const userSchema = (id: string | undefined) =>
  z.object({
    name: z.string().nonempty("User name is required."),
    email: z.string().nonempty("User Email is required."),
    phone: z
      .string()
      .nonempty("User Number is required.")
      .regex(/^\d{10}$/, "User Number must be a valid 10-digit phone number."),
    password: id
      ? z.string().optional() 
      : z.string().nonempty("User Password is required."), 
    roleId: z.string().min(1, "Please select a role"),
    profilePic: id
      ? z.any()
      : z
          .any()
          .refine((file) => file?.[0]?.size > 0, "Profile photo is required.")
          .refine((file) => file?.[0], "Profile photo is required."),
  });

export default userSchema;
