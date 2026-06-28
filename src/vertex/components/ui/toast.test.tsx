import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport } from "./toast";

describe("Toast", () => {
  it("renders toast components", () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Toast Title</ToastTitle>
          <ToastDescription>Toast Desc</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText("Toast Title")).toBeInTheDocument();
    expect(screen.getByText("Toast Desc")).toBeInTheDocument();
  });
});
