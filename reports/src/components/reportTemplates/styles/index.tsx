import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  logo: {
    width: 'auto',
    height: 60,
  },
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'justify',
    fontFamily: 'Times-Roman',
    lineHeight: 1.5,
    marginVertical: 6,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  list: {
    marginLeft: 10,
    marginTop: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 10,
    marginRight: 5,
  },
  itemContent: {
    flex: 1,
    fontSize: 12,
    textAlign: 'left',
    fontFamily: 'Times-Roman',
    lineHeight: 1.5,
  },
  figureCaption: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    padding: 0,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#f2f2f2',
  },
  tableCol: {
    flex: 1,
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'center',
    padding: 5,
  },
});

export default styles;
