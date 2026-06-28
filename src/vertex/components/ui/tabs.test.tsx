import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("switches between tabs", async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Tab 2" }));

    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });
});
