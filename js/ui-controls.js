// UI Controls Functionality
// Handles user interface interactions and button controls

// Setup all event handlers
function setupEventHandlers() {
  // Connection form handling
  document.getElementById('configForm').onsubmit = function(e) {
    e.preventDefault();
    const server = document.getElementById('server').value;
    const stationid = document.getElementById('stationid').value;
    const connectBtn = document.getElementById('connectBtn');
    
    // Access ws through ocppCore module
    if (window.ocppCore && window.ocppCore.ws && window.ocppCore.ws.readyState === WebSocket.OPEN) {
      // If connected, disconnect
      ocppCore.disconnectFromServer();
      return;
    }
    
    // Update status to connecting
    ocppCore.updateConnectionStatus('Connecting...', false);
    connectBtn.disabled = true;
    
    // Connect to WebSocket
    ocppCore.connectToServer(server, stationid);
  };

  // Start button handling
  document.getElementById('startBtn').onclick = function() {
    // Access isRemoteSession through ocppTransactions module
    if (window.ocppTransactions && window.ocppTransactions.isRemoteSession) {
      alert('Cannot start local session while remote session is active');
      return;
    }
    
    // Access isPluggedIn through simulation module
    if (!window.simulation || !window.simulation.isPluggedIn) {
      alert('Please plug in first');
      return;
    }
    
    // Access connectorStatus through simulation module
    if (window.simulation && window.simulation.connectorStatus !== 'Preparing') {
      alert('Connector must be in Preparing status to start charging');
      return;
    }
    
    ocppAuthorization.sendAuthorize(document.getElementById('idTag').value);
  };

  // Stop button handling
  document.getElementById('stopBtn').onclick = function() {
    // Access isRemoteSession through ocppTransactions module
    if (window.ocppTransactions && window.ocppTransactions.isRemoteSession) {
      alert('Cannot stop remote session from local controls');
      return;
    }
    
    ocppTransactions.stopTransaction("Local");
  };

  // Plug toggle button handling
  document.getElementById('plugToggleBtn').onclick = function() {
    // Access isPluggedIn through simulation module
    if (window.simulation && window.simulation.isPluggedIn) {
      // Currently plugged in, so unplug
      if (window.simulation && window.simulation.chargingInterval) {
        alert('Cannot unplug while charging is in progress');
        return;
      }
      uiGauges.updatePlugStatus('Disconnected');
      // Only change to Available if currently in Finishing status (OCPP compliant)
      if (window.simulation && window.simulation.connectorStatus === 'Finishing') {
        ocppStatus.updateConnectorStatus('Available');
      }
      // Note: If status is Preparing, it should remain Preparing until charging starts or stops
    } else {
      // Currently not plugged in, so plug in
      uiGauges.updatePlugStatus('Connected');
      // Only change to Preparing if currently Available (OCPP compliant)
      if (window.simulation && window.simulation.connectorStatus === 'Available') {
        ocppStatus.updateConnectorStatus('Preparing');
      }
      // Note: If status is Unavailable, it should remain Unavailable until connector becomes operational
    }
  };

  // Vehicle selection handling
  document.getElementById('vehicle').onchange = function() {
    const customVehicleDiv = document.getElementById('customVehicleDiv');
    if (this.value === 'custom') {
      customVehicleDiv.style.display = 'block';
      if (window.simulation) {
        window.simulation.batteryCapacity = parseFloat(document.getElementById('customVehicle').value);
      }
    } else {
      customVehicleDiv.style.display = 'none';
      if (window.simulation) {
        window.simulation.batteryCapacity = parseFloat(this.value);
      }
    }
    if (window.simulation) {
      window.simulation.currentSoc = parseFloat(document.getElementById('initialSoc').value);
    }
  };

  document.getElementById('customVehicle').onchange = function() {
    if (document.getElementById('vehicle').value === 'custom') {
      if (window.simulation) {
        window.simulation.batteryCapacity = parseFloat(this.value);
        window.simulation.currentSoc = parseFloat(document.getElementById('initialSoc').value);
      }
    }
  };

  document.getElementById('initialSoc').onchange = function() {
    if (window.simulation) {
      window.simulation.currentSoc = parseFloat(this.value);
    }
  };

  document.getElementById('power').onchange = function() {
    const newPower = parseFloat(this.value);
    if (newPower >= 1 && newPower <= 350) {
      if (window.simulation) {
        window.simulation.chargingPower = newPower;
        window.simulation.targetPower = newPower;
      }
    }
  };

  document.getElementById('meterInterval').onchange = function() {
    const newInterval = parseInt(this.value);
    if (window.simulation) {
      window.simulation.meterInterval = newInterval;
      if (window.simulation.chargingInterval) {
        clearInterval(window.simulation.chargingInterval);
        ocppMeterValues.startMeterValues();
      }
    }
  };
}

// Error simulation button
function addErrorSimulationButton() {
  const errorBtn = document.createElement('button');
  errorBtn.className = 'btn btn-outline-danger btn-sm mt-2';
  errorBtn.textContent = 'Simulate Fault';
  errorBtn.onclick = ocppStatus.handleConnectorFault;
  
  const statusCard = document.querySelector('.card-body');
  if (statusCard) {
    statusCard.appendChild(errorBtn);
  }
}

// Export functions for use in other modules
window.uiControls = {
  setupEventHandlers,
  addErrorSimulationButton
}; 