import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CustomDialogContent } from "./custom-dialog";

describe("CustomDialogContent", () => {
  it("renders when open", () => {
    render(
      <DialogPrimitive.Root open>
        <CustomDialogContent>
          <DialogPrimitive.Title>Dialog Title</DialogPrimitive.Title>
          <DialogPrimitive.Description>Dialog Description</DialogPrimitive.Description>
          Custom Content
        </CustomDialogContent>
      </DialogPrimitive.Root>
    );
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });
});
