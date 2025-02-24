// describe('Collocation feature', () => {
//   it('schedule devices for collocation', () => {

//   // Intercept the API request to get the running devices
//     cy.intercept('GET', '**/events/running?token=YOUR_API_TOKEN&tenant=airqo', {
//       statusCode: 200,
//       body: {
//         devices: [
//           {
//             device: 'aq_24',
//             device_id: '5f2036',
//             image: null,
//             device_number: 12347,
//             time: '2023-03-26T13:00:00.000Z',
//           },
//           {
//             device: 'aq_g5_65',
//             device_id: '624d3e',
//             image: null,
//             device_number: 123456,
//             time: '2023-03-26T13:00:00.000Z',
//           },
//         ],
//       },
//     }).as('getRunningDevices');

//     // Visit the collocation page before each test
//     cy.visit('/collocation/add_monitor');

//     // Wait for the API request to finish
//     cy.wait('@getRunningDevices');

//     // Verify that the table is visible
//     cy.get('[data-testid="collocation-device-selection-table"]').should('be.visible');

//     // Use the `eq()` method to select the first and second row of the table
//     cy.get('table tbody tr').eq(0).find('input[type="checkbox"]').check();
//     cy.get('table tbody tr').eq(1).find('input[type="checkbox"]').check();

//     // Verify that the checkboxes are checked
//     cy.get('table tbody tr').eq(0).find('input[type="checkbox"]').should('be.checked');
//     cy.get('table tbody tr').eq(1).find('input[type="checkbox"]').should('be.checked');

//     // Select the first option from the duration options
//     cy.get('[data-testid="duration-option"]').eq(0).find('input[type="radio"]').check();

//     // Verify that the radio button is checked
//     cy.get('[data-testid="duration-option"]')
//       .eq(0)
//       .find('input[type="radio"]')
//       .should('be.checked');

//     // Check if the schedule button is visible and click it
//     cy.get('[data-testid="collocation-schedule-button"]', { timeout: 5000 }).should('be.visible');
//     cy.get('[data-testid="collocation-schedule-button"]', { timeout: 5000 }).click();

//     // Visit the device collocation success page
//     cy.visit('/collocation/collocate_success');

//     // Click the view device status button
//     cy.get('[data-testid="collocation-view-device-status-button"]').click();

//     // Visit the device status table on the collocate page
//     cy.visit('/collocation/collocate');
//   });

//   it('shows a toast when the API request fails to display devices for collocation', () => {
//     // Intercept the API request to get the devices for collocation
//     cy.intercept('GET', '**/events/running?tenant=airqo', {
//       statusCode: 500,
//       body: {},
//     }).as('getCollocationDevices');

//     // Visit the collocation page
//     cy.visit('/collocation/add_monitor');

//     // Wait for the API request to finish
//     cy.wait('@getCollocationDevices');

//     // Verify that the toast is visible and contains the correct message
//     cy.get('[data-testid="collocation-error-toast"]')
//       .should('be.visible')
//       .contains(
//         'Uh-oh! Unable to collocate devices. Please check your connection or try again later.',
//       );
//   });

//   it('shows device summary table when the API request is successful', () => {
//     // Intercept the API request to get the device status summary
//     cy.intercept('GET', '**/summary', {
//       statusCode: 200,
//       body: {
//         data: [
//           {
//             device_name: 'airqo-4001',
//             status: 'running',
//             start_date: '2021-05-20T12:00:00.000Z',
//             end_date: '2021-05-20T12:00:00.000Z',
//           },
//           {
//             device_name: 'airqo-4002',
//             status: 'running',
//             start_date: '2021-05-20T12:00:00.000Z',
//             end_date: '2021-05-20T12:00:00.000Z',
//           },
//         ],
//       },
//     }).as('getDeviceStatusSummary');

//     // Visit the collocate page
//     cy.visit('/collocation/collocate');

//     // Wait for the API request to finish
//     cy.wait('@getDeviceStatusSummary');

//     // Verify that the device status summary table is visible
//     cy.get('[data-testid="collocation-device-status-summary"]').should('be.visible');

//     // Use the `eq()` method to click the span element in last row of the table
//     cy.get('table tbody tr:last-of-type span').click({ multiple: true });
//   });

//   it('display the correlation charts when the api is successful', () => {
//     // Intercept the API request to get the data
//     cy.intercept('POST', '**/data', {
//       statusCode: 200,
//       body: {
//         devices: ['aq_g520'],
//         startDate: '2023-03-15',
//         endDate: '2023-03-18',
//       },
//     }).as('getCollocationResults');

//     // Visit the collocate page
//     cy.visit(
//       '/collocation/reports/monitor_report/aq_g520?devices=aq_g520&startDate=2023-03-15&endDate=2023-03-18',
//     );

//     // Wait for the API request to finish
//     cy.wait('@getCollocationResults', { timeout: 5000 });

//     // Verify that the chart is visible
//     cy.get('[data-testid="correlation-chart"]').should('be.visible');
//   });

//   it('shows the alert when the collocation results api is not successful', () => {
//     // Intercept the API request to get the collocation results
//     cy.intercept('POST', '**/data', {
//       statusCode: 500,
//       body: {
//         devices: ['aq_g520'],
//         startDate: '2023-03-15',
//         endDate: '2023-03-18',
//       },
//     }).as('getCollocationResults');

//     // Visit the collocate page
//     cy.visit(
//       '/collocation/reports/monitor_report/aq_g5_87?devices=aq_g5_87&startDate=2023-01-21&endDate=2023-01-24',
//     );

//     // Wait for the API request to finish
//     cy.wait('@getCollocationResults', { timeout: 5000 });

//     // Verify that the collocation results are visible
//     cy.get('[data-testid="monitor-report-error-toast"]').should('be.visible');
//   });
// });
