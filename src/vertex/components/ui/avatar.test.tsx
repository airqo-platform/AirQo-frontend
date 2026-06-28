import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders fallback", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
