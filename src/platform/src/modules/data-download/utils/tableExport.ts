import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnConfig, TableItem } from '../types/dataExportTypes';

type ExportFormat = 'csv' | 'pdf';

interface ExportTableArgs {
  title: string;
  data: TableItem[];
  columns: ColumnConfig[];
}

interface ResolvedColumn {
  label: string;
  value: string;
}

const getTextFromNode = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextFromNode).filter(Boolean).join(' ');
  }

  if (React.isValidElement(node)) {
    return getTextFromNode(node.props.children);
  }

  if (typeof node === 'object') {
    return JSON.stringify(node);
  }

  return String(node);
};

const getCellText = (column: ColumnConfig, item: TableItem): string => {
  const rawValue = item[column.key];

  if (column.render) {
    return getTextFromNode(column.render(rawValue));
  }

  return getTextFromNode(rawValue as React.ReactNode);
};

const resolveColumns = (
  data: TableItem[],
  columns: ColumnConfig[]
): ResolvedColumn[][] => {
  return data.map(item =>
    columns.map(column => ({
      label: column.label,
      value: getCellText(column, item),
    }))
  );
};

const sanitizeFileName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildExportFileName = (title: string, format: ExportFormat): string => {
  const datePart = new Date().toISOString().split('T')[0];
  const safeTitle = sanitizeFileName(title) || 'table-export';

  return `${safeTitle}-${datePart}.${format}`;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: string): string => {
  if (!value) {
    return '';
  }

  const escaped = value.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

const buildCsvContent = (
  columns: ColumnConfig[],
  data: TableItem[]
): string => {
  const rows = resolveColumns(data, columns);
  const headerRow = columns
    .map(column => escapeCsvValue(column.label))
    .join(',');
  const bodyRows = rows.map(row =>
    row.map(cell => escapeCsvValue(cell.value)).join(',')
  );

  return [headerRow, ...bodyRows].join('\n');
};

export const exportTableAsCsv = ({ title, data, columns }: ExportTableArgs) => {
  const csvContent = buildCsvContent(columns, data);
  const fileName = buildExportFileName(title, 'csv');
  const blob = new Blob(['\uFEFF', csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  downloadBlob(blob, fileName);
};

export const exportTableAsPdf = ({ title, data, columns }: ExportTableArgs) => {
  const orientation = columns.length > 4 ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const rows = resolveColumns(data, columns);
  const headers = columns.map(column => column.label);
  const generatedAt = new Date().toLocaleString();
  const fileName = buildExportFileName(title, 'pdf');

  autoTable(doc, {
    head: [headers],
    body: rows.map(row => row.map(cell => cell.value)),
    startY: 54,
    theme: 'grid',
    margin: { top: 54, left: 24, right: 24, bottom: 32 },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: dataPoint => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setTextColor(15, 118, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(title, 24, 24);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Rows: ${data.length} • Generated: ${generatedAt}`, 24, 38);

      doc.setDrawColor(226, 232, 240);
      doc.line(24, 44, pageWidth - 24, 44);

      doc.setTextColor(100, 116, 139);
      doc.text(
        `Page ${dataPoint.pageNumber}`,
        pageWidth - 24,
        pageHeight - 18,
        { align: 'right' }
      );
    },
  });

  doc.save(fileName);
};
