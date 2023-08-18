import {
  DataTableCell,
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@david.kucsai/react-pdf-table';
import { Document, PDFViewer, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const ExportStatusReport = ({ batchId }) => {
  return (
    <PDFViewer>
      <Document>
        <Page size='A4'>
          <View>
            <Text>Collocation report for batch X</Text>
            <Text>(date 1 to date 2)</Text>
          </View>

          <View>
            <Text>Collocation overview</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default ExportStatusReport;
