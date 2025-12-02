"use client";

import { useState } from "react";
import { CircleQuestionMark, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import InputField from "../shared/InputField";
import { useResetPasswordMutation } from "@/redux/featured/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import toast from "react-hot-toast";

export default function PasswordChangeForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formData, setFormData] = useState({
    current: "",
    new: "",
    reenter: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentUser = useAppSelector(selectCurrentUser)


  console.log(currentUser);


  const fields = [
    {
      key: "current",
      label: "Current Password",
      placeholder: "Enter current password",
    },
    {
      key: "new",
      label: "New Password",
      placeholder: "Enter new password",
    },
    {
      key: "reenter",
      label: "Re-enter Password",
      placeholder: "Re-enter new password",
    },
  ] as const;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.current.trim()) {
      newErrors.current = "Current password is required";
    }

    if (!formData.new.trim()) {
      newErrors.new = "New password is required";
    } else if (formData.new.length < 8) {
      newErrors.new = "Password must be at least 8 characters";
    }

    if (!formData.reenter.trim()) {
      newErrors.reenter = "Please re-enter your password";
    } else if (formData.new !== formData.reenter) {
      newErrors.reenter = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }


    try {
      const result = await resetPassword({
        data: {
          userId: currentUser?._id || "",
          oldPassword: formData.current,
          newPassword: formData.new,
        }
      }).unwrap();

      toast.success("Password changed successfully");

      setFormData({ current: "", new: "", reenter: "" });
    } catch (error: any) {
      toast.error("Failed to change password");
    }
  }; return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Change Password</h2>
        <a
          href="#"
          className="text-sm text-[#6467F2] flex items-center gap-1
        underline underline-offset-4"
        >
          Need help
          <CircleQuestionMark size={18} />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder }, index) => (
          <div key={key} className="relative">
            <InputField
              label={label}
              placeholder={placeholder}
              type={showPassword ? "text" : "password"}
              value={formData[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onIconClick={() => setShowPassword(!showPassword)}
            />

            {errors[key] && (
              <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
            )}

            
          </div>
        ))}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Change"}
        </Button>
      </form>
    </div>
  );
}
