import React from "react";
import FormComponent from "@/components/forms/authForm";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <FormComponent btnText="Login">
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 dark:text-white font-medium"
          />
        </div>
        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 dark:text-white font-medium"
          />
        </div>
      </FormComponent>
    </div>
  );
}
