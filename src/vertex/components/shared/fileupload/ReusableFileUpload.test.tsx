import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReusableFileUpload from "./ReusableFileUpload";

describe("ReusableFileUpload", () => {
  it("renders with placeholder and label", () => {
    render(<ReusableFileUpload label="Upload File" />);
    expect(screen.getByLabelText("Upload File")).toBeInTheDocument();
    expect(screen.getByText("Upload file")).toBeInTheDocument(); // default placeholder
  });

  it("handles file selection", () => {
    const handleChange = vi.fn();
    render(<ReusableFileUpload label="Upload" onChange={handleChange} />);
    
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const input = screen.getByLabelText("Upload");
    
    fireEvent.change(input, { target: { files: [file] } });
    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it("shows error state", () => {
    render(<ReusableFileUpload label="Upload" error="File too large" />);
    expect(screen.getByText("File too large")).toBeInTheDocument();
  });
});
