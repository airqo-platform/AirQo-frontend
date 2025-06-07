// Using Cypress for E2E tests
describe('Device Dashboard', () => {
    beforeEach(() => {
      // Visit the dashboard page
      cy.visit('/dashboard');
      
      // Mock API responses
      cy.intercept('GET', '/api/device-counts', {
        statusCode: 200,
        body: {
          total_devices: 150,
          active_devices: 120,
          offline_devices: 30,
          deployed_devices: 130,
          not_deployed: 20
        }
      }).as('getDeviceCounts');
      
      cy.intercept('GET', '/api/devices', {
        statusCode: 200,
        body: [
          { device_id: 'device-1', device_name: 'Test Device 1', status: 'deployed', is_online: true },
          { device_id: 'device-2', device_name: 'Test Device 2', status: 'deployed', is_online: false }
        ]
      }).as('getDevices');
      
      // Wait for API responses
      cy.wait(['@getDeviceCounts', '@getDevices']);
    });
    
    it('displays the device status card with correct counts', () => {
      cy.get('[data-testid="status-card"]').within(() => {
        cy.contains('150').should('be.visible'); // Total devices
        cy.contains('120').should('be.visible'); // Active devices
        cy.contains('30').should('be.visible');  // Offline devices
        cy.contains('130').should('be.visible'); // Deployed devices
      });
    });
    
    it('displays the device list with correct data', () => {
      cy.get('[data-testid="device-list"]').within(() => {
        cy.contains('Test Device 1').should('be.visible');
        cy.contains('Test Device 2').should('be.visible');
        
        // Check status indicators
        cy.get('[data-testid="status-indicator-device-1"]')
          .should('have.class', 'bg-green-500'); // Online
        cy.get('[data-testid="status-indicator-device-2"]')
          .should('have.class', 'bg-red-500');   // Offline
      });
    });
    
    it('navigates to device details when clicking on a device', () => {
      cy.intercept('GET', '/api/device-detail/device-1', {
        statusCode: 200,
        body: {
          device: { id: 'device-1', name: 'Test Device 1' },
          location: { latitude: 0.347596, longitude: 32.582520 },
          latest_reading: { pm2_5: 15.5, pm10: 25.3 }
        }
      }).as('getDeviceDetail');
      
      // Click on the first device
      cy.contains('Test Device 1').click();
      
      // Ensure navigation occurred
      cy.url().should('include', '/devices/device-1');
      
      // Wait for detail API
      cy.wait('@getDeviceDetail');
      
      // Check device detail page content
      cy.contains('Test Device 1').should('be.visible');
      cy.contains('PM2.5: 15.5').should('be.visible');
    });
    
    it('shows device locations on the map', () => {
      cy.intercept('GET', '/api/device-locations', {
        statusCode: 200,
        body: [
          { 
            id: 'device-1', 
            name: 'Test Device 1', 
            latitude: 0.347596, 
            longitude: 32.582520,
            status: 'ACTIVE'
          }
        ]
      }).as('getDeviceLocations');
      
      // Go to the map view
      cy.contains('Map View').click();
      
      // Wait for locations API
      cy.wait('@getDeviceLocations');
      
      // Check if map loads
      cy.get('[data-testid="device-map"]').should('be.visible');
      
      // Check if device marker is displayed
      cy.get('[data-testid="map-marker-device-1"]').should('be.visible');
    });
  });