import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";

describe("Table", () => {
  it("renders table structure", () => {
    render(
      <Table>
        <TableCaption>A test table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell Data</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer Data</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText("A test table")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cell Data")).toBeInTheDocument();
    expect(screen.getByText("Footer Data")).toBeInTheDocument();
  });
});
