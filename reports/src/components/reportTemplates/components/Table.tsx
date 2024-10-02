/* eslint-disable jsx-a11y/alt-text */
'use client';

import { View, Text } from '@react-pdf/renderer';
import React, { FC } from 'react';

import styles from '../styles';

interface TableProps {
  headers: string[];
  rows: { [key: string]: any }[];
}

const Table: FC<TableProps> = ({ headers, rows }) => (
  <View style={styles.table}>
    {/* Table Header */}
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {headers.map((header, index) => (
        <View key={index} style={styles.tableCol}>
          <Text style={styles.tableHeaderCell}>{header}</Text>
        </View>
      ))}
    </View>
    {/* Table Rows */}
    {rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={[styles.tableRow, { backgroundColor: row.bgColor || 'transparent' }]}
      >
        {Object.keys(row).map((key, colIndex) =>
          key !== 'bgColor' ? (
            <View key={colIndex} style={styles.tableCol}>
              <Text style={styles.tableCell}>{row[key]}</Text>
            </View>
          ) : null,
        )}
      </View>
    ))}
  </View>
);

export default Table;
