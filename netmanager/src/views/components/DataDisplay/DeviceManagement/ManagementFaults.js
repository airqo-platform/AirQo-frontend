import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

const sample = {
  datetime: '2020-07-15T13:00',
  values: [
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:03',
      device_id: 'aq_01',
      's1_pm2.5': 44.12,
      's2_pm2.5': 44.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:05',
      device_id: 'aq_02',
      's1_pm2.5': 12.12,
      's2_pm2.5': 43.12,
      offset_fault: 0,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
    {
      datetime: '2020-07-15T13:07',
      device_id: 'aq_03',
      's1_pm2.5': 80,
      's2_pm2.5': 80.12,
      offset_fault: 1,
      out_of_bounds_fault: 1,
      high_variance_fault: 1,
      data_loss_fault: 1,
    },
  ],
};

const columns = [
  { id: 'device_id', label: 'Device ID', minWidth: 100 },
  {
    id: 'datetime',
    label: 'Datetime',
    minWidth: 170,
    // format: (value) => value.toLocaleString('en-US').replace('T', ' '),
  },
  {
    id: 'sensor1_PM2_5',
    label: 'Sensor1 PM2.5',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'sensor2_PM2_5',
    label: 'Sensor2 PM2.5',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'off_fault',
    label: 'Offset Fault',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'oob_fault',
    label: 'Out of Bound Fault',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'dl_fault',
    label: 'Data Loss Fault',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toFixed(2),
  },
  {
    id: 'hv_fault',
    label: 'High Variance Fault',
    minWidth: 100,
    align: 'right',
    // format: (value) => value.toFixed(2),
  },
];

function createData(
  device_id,
  datetime,
  sensor1_PM2_5,
  sensor2_PM2_5,
  off_fault,
  oob_fault,
  dl_fault,
  hv_fault
) {
  return {
    device_id,
    datetime,
    sensor1_PM2_5,
    sensor2_PM2_5,
    off_fault,
    oob_fault,
    dl_fault,
    hv_fault,
  };
}
let rows = [];
sample.values.forEach((reading) => {
  rows.push(
    createData(
      reading.device_id,
      reading.datetime.replace('T', ' '),
      reading['s1_pm2.5'],
      reading['s2_pm2.5'],
      reading.offset_fault,
      reading.out_of_bounds_fault,
      reading.data_loss_fault,
      reading.high_variance_fault
    )
  );
});

export default function ColumnGroupingTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <ErrorBoundary>
      <div className={'container-wrapper'}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '50px',
          }}
        >
          <Paper sx={{ width: '100%' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={8}>
                      Hour {sample.datetime.replace('T', ' ')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" colSpan={4}>
                      Device Info
                    </TableCell>
                    <TableCell align="center" colSpan={4}>
                      Faults
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ top: 57, minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.code}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number'
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </ErrorBoundary>
  );
}
