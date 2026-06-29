import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./alert-dialog";

describe("AlertDialog", () => {
  it("opens alert dialog", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
    
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    
    expect(await screen.findByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });
});
