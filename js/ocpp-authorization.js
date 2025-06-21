// OCPP Authorization Functionality
// Handles Authorize requests and responses

function sendAuthorize(idTag) {
  ocppCore.sendRequest("Authorize", {
    idTag: idTag
  });
}

function handleAuthorizeResponse(messageId, payload) {
  if (payload.idTagInfo.status === "Accepted") {
    // Authorization successful, proceed with transaction
    if (window.ocppTransactions && window.ocppTransactions.isRemoteSession) {
      // For remote start, the transaction was already initiated
      return;
    } else {
      // For local start, proceed with StartTransaction
      proceedWithStartTransaction();
    }
  } else {
    // Authorization failed
    ocppStatus.setConnectorError("AuthorizationError");
    alert('Authorization failed: ' + payload.idTagInfo.status);
    ocppStatus.updateConnectorStatus('Preparing');
    uiGauges.updateSessionButtons();
  }
}

function proceedWithStartTransaction() {
  if (window.simulation) {
    window.simulation.meterValue = 0;
    window.simulation.currentSoc = parseFloat(document.getElementById('initialSoc').value);
  }
  
  ocppCore.sendRequest("StartTransaction", {
    connectorId: 1,
    idTag: document.getElementById('idTag').value,
    meterStart: 0,
    timestamp: new Date().toISOString()
  });
}

// Export functions for use in other modules
window.ocppAuthorization = {
  sendAuthorize,
  handleAuthorizeResponse,
  proceedWithStartTransaction
}; 