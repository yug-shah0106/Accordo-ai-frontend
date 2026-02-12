import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate for routing
import api from "../../api";
import toast from "react-hot-toast";
import Button from "../Button";

const VerifyOtp = () => {
  const location = useLocation();
  const { email, reqUrl, redirectUrl, resendReq } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const [timer, setTimer] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendEnabled(true);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const newOtp = [...otp];

    if (value) {
      // Prevent non-numeric characters
      if (/[^0-9]/.test(value)) return;

      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input if the current one is filled
      if (index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    } else {
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  // Handle resend functionality
  const handleResend = async () => {
    try {
      await api.post(`${resendReq}`, { email });
      setIsResendEnabled(false);
      setTimer(60);
      toast.success("Resend email sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index]) {
      // Focus the previous input on Backspace if the current input is empty
      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const otpValue = otp.join("");
      const {
        data: { data },
      } = await api.post(reqUrl, {
        email,
        otp: otpValue,
      });
      toast.success("Otp Verification Success");
      navigate(`${redirectUrl}/${data?.id}`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-md pt-6 pb-0 mx-auto mt-8">
      <h2 className="text-2xl font-semibold text-center mb-6">Verify OTP</h2>

      <div className="flex justify-between mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`} // Unique ID for each input
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            maxLength={1}
            className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-xl"
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        <p>
          <span
            className={`text-black font-normal ${
              isResendEnabled
                ? "cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={isResendEnabled ? handleResend : undefined}
          >
            Resend Code
          </span>{" "}
          {isResendEnabled ? "" : `in ${timer} sec`}
        </p>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={otp.includes("") || otp.length < 6}
      >
        Submit
      </Button>
    </div>
  );
};

export default VerifyOtp;
