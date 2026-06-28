import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "./form";

const TestForm = () => {
  const form = useForm({ defaultValues: { username: "" } });
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <input {...field} placeholder="Enter username" />
            </FormControl>
            <FormDescription>Your unique handle.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

describe("Form", () => {
  it("renders form fields correctly", () => {
    render(<TestForm />);
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByText("Your unique handle.")).toBeInTheDocument();
  });
});
