// OCPP Boot Notification Functionality
// Handles BootNotification and related responses

function sendBootNotification() {
  ocppCore.sendRequest("BootNotification", {
    chargePointVendor: document.getElementById('vendor').value,
    chargePointModel: document.getElementById('model').value,
    chargePointSerialNumber: document.getElementById('serialNumber').value,
    firmwareVersion: document.getElementById('firmwareVersion').value,
    iccid: document.getElementById('iccid').value,
    imsi: document.getElementById('imsi').value,
    meterType: document.getElementById('meterType').value,
    meterSerial: document.getElementById('meterSerial').value
  });
}

function handleBootNotificationResponse(messageId, payload) {
  // Send status notification for each connector
  const numberOfConnectors = parseInt(localStorage.getItem('ocpp_config_NumberOfConnectors')) || 1;
  
  for (let i = 0; i <= numberOfConnectors; i++) {
    // For connector 0 (main connector) and connector 1, set as Available
    // For other connectors, set as Unavailable
    const status = (i === 0 || i === 1) ? "Available" : "Unavailable";
    ocppStatus.sendStatusNotification(i, status);
  }
  
  // Update the UI to reflect connector 1's status
  ocppStatus.updateConnectorStatus("Available");
  
  // Start heartbeat mechanism
  ocppHeartbeat.startHeartbeat();
}

// Export functions for use in other modules
window.ocppBoot = {
  sendBootNotification,
  handleBootNotificationResponse
}; 