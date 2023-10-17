import {
  DataTableCell,
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@david.kucsai/react-pdf-table';
import {
  Document,
  PDFDownloadLink,
  PDFViewer,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const ExportStatusReport = ({ batchData }) => {
  console.log('batchData', batchData);
  return (
    <PDFViewer>
      <Document>
        <Page size='A4' style={styles.page}>
          <View style={styles.section}>
            <Text>Section #1</Text>
          </View>
          <View style={styles.section}>
            <Text>Section #2</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default ExportStatusReport;
