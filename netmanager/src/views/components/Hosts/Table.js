import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

const DataTable = ({ title, columns, rows, onRowClick, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const filteredRows = rows.filter((row) => {
    return columns.some((column) => {
      if (column.format) {
        return column.format(null, row).toString().toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return row[column.id].toString().toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  });

  return (
    <Paper>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px'
        }}>
        <Typography variant="h5" style={{ fontWeight: 'bold', color: '#3f51b5' }}>
          {title}
        </Typography>
        <TextField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
      <TableContainer>
        <Table>
          <TableHead style={{ backgroundColor: 'white' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={column.headerStyle}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ backgroundColor: 'white' }}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick(row)}
                    style={{ cursor: 'pointer' }}>
                    {columns.map((column) => (
                      <TableCell key={column.id} style={column.cellStyle}>
                        {column.format ? column.format(null, row) : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          SelectProps={{
            style: {
              display: 'flex',
              alignItems: 'center',
              color: '#3f51b5',
              position: 'relative',
              fontWeight: 'bold',
              padding: '10px'
            }
          }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
