// OCPP Transaction Functionality
// Handles StartTransaction, StopTransaction, and related responses

let transactionId = null;
let isRemoteSession = false;

function handleStartTransactionResponse(messageId, payload) {
  if (payload.idTagInfo.status === "Accepted") {
    transactionId = payload.transactionId;
    ocppStatus.updateConnectorStatus('Charging');
    ocppMeterValues.startMeterValues();
    uiGauges.updateSessionButtons();
  } else {
    alert('Transaction failed: ' + payload.idTagInfo.status);
    ocppStatus.updateConnectorStatus('Preparing');
    uiGauges.updateSessionButtons();
    isRemoteSession = false;
  }
}

function handleRemoteStartTransaction(messageId, payload) {
  if (window.simulation && window.simulation.chargingInterval) {
    ocppCore.sendResponse(messageId, { status: "Rejected" });
    return;
  }
  
  isRemoteSession = true;
  if (window.simulation) {
    window.simulation.meterValue = 0;
    window.simulation.currentSoc = parseFloat(document.getElementById('initialSoc').value);
  }
  
  ocppCore.sendRequest("StartTransaction", {
    connectorId: payload.connectorId || 1,
    idTag: payload.idTag,
    meterStart: 0,
    timestamp: new Date().toISOString()
  });
  
  ocppCore.sendResponse(messageId, { status: "Accepted" });
}

function handleRemoteStopTransaction(messageId, payload) {
  if (!window.simulation || !window.simulation.chargingInterval) {
    ocppCore.sendResponse(messageId, { status: "Rejected" });
    return;
  }
  
  stopTransaction("Remote");
  ocppCore.sendResponse(messageId, { status: "Accepted" });
}

function stopTransaction(reason) {
  // Stop all intervals
  if (window.simulation && window.simulation.chargingInterval) {
    clearInterval(window.simulation.chargingInterval);
  }
  if (window.simulation && window.simulation.uiUpdateInterval) {
    clearInterval(window.simulation.uiUpdateInterval);
  }
  if (window.simulation) {
    window.simulation.chargingInterval = null;
    window.simulation.uiUpdateInterval = null;
  }
  
  // Send final meter values with Transaction.End context
  if (transactionId) {
    ocppMeterValues.sendMeterValuesWithContext("Transaction.End");
  }
  
  // Reset power to 0
  if (window.simulation) {
    window.simulation.currentPower = 0;
    window.simulation.targetPower = 0;
  }
  
  // Reset gauges to show 0 values
  uiGauges.resetGauges();
  
  // Send stop transaction request
  ocppCore.sendRequest("StopTransaction", {
    transactionId: transactionId,
    meterStop: window.simulation ? window.simulation.meterValue : 0,
    timestamp: new Date().toISOString(),
    reason: reason
  });
  
  // Set connector to Finishing status
  ocppStatus.updateConnectorStatus('Finishing');
  
  // Reset session flags
  isRemoteSession = false;
  transactionId = null;
  
  uiGauges.updateSessionButtons();
}

// Export functions for use in other modules
window.ocppTransactions = {
  handleStartTransactionResponse,
  handleRemoteStartTransaction,
  handleRemoteStopTransaction,
  stopTransaction,
  get isRemoteSession() { return isRemoteSession; },
  get transactionId() { return transactionId; }
}; 