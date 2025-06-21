// OCPP Status Notification Functionality
// Handles StatusNotification and connector status management

let connectorErrorCode = "NoError";

function sendStatusNotification(connectorId, status) {
  ocppCore.sendRequest("StatusNotification", {
    connectorId: connectorId,
    errorCode: connectorErrorCode,
    status: status,
    timestamp: new Date().toISOString()
  });
}

function updateConnectorStatus(status) {
  const statusElement = document.getElementById('connectorStatus');
  statusElement.textContent = status;
  let statusClass = 'bg-secondary';
  switch(status) {
    case 'Available': 
      statusClass = 'bg-success'; 
      clearConnectorError(); // Clear errors when available
      break;
    case 'Preparing': 
      statusClass = 'bg-warning'; 
      clearConnectorError(); // Clear errors when preparing
      break;
    case 'Charging': 
      statusClass = 'bg-info'; 
      clearConnectorError(); // Clear errors when charging
      break;
    case 'Finishing': 
      statusClass = 'bg-primary'; 
      break;
    case 'Faulted': 
      statusClass = 'bg-danger'; 
      break;
  }
  statusElement.className = 'badge ' + statusClass;
  if (window.simulation) {
    window.simulation.connectorStatus = status;
  }
  
  // Send status notification for connector 1
  if (window.ocppCore && window.ocppCore.ws && window.ocppCore.ws.readyState === WebSocket.OPEN) {
    sendStatusNotification(1, status);
  }
  
  uiGauges.updateSessionButtons();
}

function setConnectorError(errorCode) {
  connectorErrorCode = errorCode;
  // Send status notification with new error code
  if (window.ocppCore && window.ocppCore.ws && window.ocppCore.ws.readyState === WebSocket.OPEN) {
    sendStatusNotification(1, window.simulation ? window.simulation.connectorStatus : 'Available');
  }
}

function clearConnectorError() {
  if (connectorErrorCode !== "NoError") {
    connectorErrorCode = "NoError";
    // Send status notification with cleared error
    if (window.ocppCore && window.ocppCore.ws && window.ocppCore.ws.readyState === WebSocket.OPEN) {
      sendStatusNotification(1, window.simulation ? window.simulation.connectorStatus : 'Available');
    }
  }
}

function handleConnectorFault() {
  // Set connector to faulted state
  setConnectorError("ConnectorLockFailure");
  updateConnectorStatus('Faulted');
  
  // Stop any active transaction
  if (window.simulation && window.simulation.chargingInterval) {
    ocppTransactions.stopTransaction("EmergencyStop");
  }
}

// Export functions for use in other modules
window.ocppStatus = {
  sendStatusNotification,
  updateConnectorStatus,
  setConnectorError,
  clearConnectorError,
  handleConnectorFault
}; 