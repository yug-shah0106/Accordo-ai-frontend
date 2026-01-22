import { ReactNode, MouseEvent } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  type = "button",
  children,
  className = "",
  onClick,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const baseStyles =
    "w-full py-3 text-base font-medium text-white rounded-md focus:outline-none focus:ring transition duration-150 ease-in-out";
  const defaultStyles = "bg-blue-500 focus:ring-blue-300";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${defaultStyles} ${
        disabled || loading ? "cursor-not-allowed" : ""
      } ${className}`}
    >
      {loading ? (
        <svg
          className="w-5 h-5 animate-spin mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
