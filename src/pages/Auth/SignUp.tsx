import InputField from "../../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";
import Checkbox from "../../components/CheckBox";
import { useState } from "react";
import Modal from "../../components/Modal";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const openModal = (): void => {
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setTerms(false);
  };

  const handleAction = (): void => {
    setTerms(true);
  };

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      if (!terms) {
        toast.error("Please accept the terms and conditions");
        return;
      }
      const { confirmPassword, ...registerData } = data;
      const response = await api.post("/auth/register", registerData);
      console.log({ response });
      navigate("/sign-in");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-sm pt-6 px-6 pb-0 mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label={"Name"}
          type="text"
          name="name"
          register={register}
          error={errors.name}
          placeholder="Full Name"
        />
        <InputField
          label={"Email"}
          type="text"
          name="email"
          register={register}
          error={errors.email}
          placeholder="name@work.com"
        />
        <InputField
          label={"Password"}
          type="password"
          name="password"
          register={register}
          error={errors.password}
          placeholder="Enter password"
        />
        <InputField
          label={"Confirm Password"}
          type="password"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword}
          placeholder="Enter password"
        />
        <div className="flex items-center gap-4 my-2 w-full mt-2">
          <Checkbox
            name="terms"
            checked={
              isSubmitting || Object.keys(errors)?.length > 0 ? false : terms
            }
            onChange={(evnt) => {
              setTerms(evnt.target.checked);
            }}
            disabled={isSubmitting || Object.keys(errors)?.length > 0}
          />
          <p
            onClick={() => openModal()}
            className="text-gray-700 cursor-pointer flex-1"
          >
            I agree to{" "}
            <span className="font-bold text-[#000] cursor-pointer">
              Terms of Use
            </span>{" "}
            and{" "}
            <span className="font-bold text-[#000] cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          To Register
        </Button>
      </form>

      {isModalOpen && (
        <Modal
          heading="Terms and Conditions"
          body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          onClose={closeModal}
          handleClose={handleClose}
          onAction={handleAction}
          actionText="Accept"
        />
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="bg-[#D3DBFD33]/[20%] pt-3 pb-0 rounded-md text-[#18100E]">
          <p>
            Don't have an account?{" "}
            <Link to="/sign-in" className=" hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
