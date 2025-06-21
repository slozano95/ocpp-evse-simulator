// OCPP Core Functionality
// Handles WebSocket connection, message routing, and common utilities

let ws = null;
let messageIdCounter = 1;
let pendingRequests = {};

// Message handling utilities
function getNextMessageId() {
  return (messageIdCounter++).toString();
}

function sendRequest(action, payload) {
  const messageId = getNextMessageId();
  const msg = [2, messageId, action, payload];
  pendingRequests[messageId] = { action: action };
  ws.send(JSON.stringify(msg));
  logMsg(JSON.stringify(msg), 'out');
}

function sendResponse(messageId, response) {
  const msg = [3, messageId, response];
  ws.send(JSON.stringify(msg));
  logMsg(JSON.stringify(msg), 'out');
}

function logMsg(msg, type) {
  const log = document.getElementById('log');
  const div = document.createElement('div');
  div.className = type === 'out' ? 'msg-out' : 'msg-in';
  div.textContent = (type === 'out' ? '↑ ' : '↓ ') + msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// WebSocket connection management
function connectToServer(server, stationid) {
  ws = new WebSocket(server + '/' + stationid, 'ocpp1.6');
  
  ws.onopen = () => {
    logMsg('Connected to ' + ws.url, 'in');
    updateConnectionStatus('Connected', true);
    document.getElementById('connectBtn').textContent = 'Disconnect';
    document.getElementById('connectBtn').classList.remove('btn-primary');
    document.getElementById('connectBtn').classList.add('btn-danger');
    document.getElementById('connectBtn').disabled = false;
    simulation.reinitializeUI();
    uiGauges.updateSessionButtons();
    ocppBoot.sendBootNotification();
  };
  
  ws.onmessage = (event) => {
    logMsg(event.data, 'in');
    try {
      const message = JSON.parse(event.data);
      if (message[0] === 2) { // Request
        const [_, messageId, action, payload] = message;
        handleIncomingRequest(messageId, action, payload);
      } else if (message[0] === 3) { // Response
        const [_, messageId, payload] = message;
        handleIncomingResponse(messageId, payload);
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  };
  
  ws.onclose = () => {
    logMsg('WebSocket closed', 'in');
    if (window.simulation && window.simulation.chargingInterval) {
      clearInterval(window.simulation.chargingInterval);
    }
    if (window.simulation && window.simulation.uiUpdateInterval) {
      clearInterval(window.simulation.uiUpdateInterval);
    }
    ocppHeartbeat.stopHeartbeat();
    if (meterGraph) {
      meterGraph.destroy();
      meterGraph = null;
    }
    if (powerGauge) {
      powerGauge.destroy();
      powerGauge = null;
    }
    if (voltageGauge) {
      voltageGauge.destroy();
      voltageGauge = null;
    }
    if (currentGauge) {
      currentGauge.destroy();
      currentGauge = null;
    }
    if (socGauge) {
      socGauge.destroy();
      socGauge = null;
    }
    updateConnectionStatus('Disconnected', false);
    document.getElementById('connectBtn').textContent = 'Connect';
    document.getElementById('connectBtn').classList.remove('btn-danger');
    document.getElementById('connectBtn').classList.add('btn-primary');
    document.getElementById('connectBtn').disabled = false;
    uiGauges.updateSessionButtons();
  };
  
  ws.onerror = (err) => {
    logMsg('WebSocket error', 'in');
    updateConnectionStatus('Error', false);
    ocppStatus.setConnectorError("CommunicationError");
    document.getElementById('connectBtn').disabled = false;
  };
}

function disconnectFromServer() {
  if (ws) {
    ws.close();
  }
}

function handleIncomingRequest(messageId, action, payload) {
  switch (action) {
    case "RemoteStartTransaction":
      ocppTransactions.handleRemoteStartTransaction(messageId, payload);
      break;
    case "RemoteStopTransaction":
      ocppTransactions.handleRemoteStopTransaction(messageId, payload);
      break;
    case "SetConfiguration":
      ocppConfiguration.handleSetConfiguration(messageId, payload);
      break;
    // Add other request handlers as needed
  }
}

function handleIncomingResponse(messageId, payload) {
  const pendingRequest = pendingRequests[messageId];
  if (pendingRequest) {
    switch (pendingRequest.action) {
      case "BootNotification":
        ocppBoot.handleBootNotificationResponse(messageId, payload);
        break;
      case "StartTransaction":
        ocppTransactions.handleStartTransactionResponse(messageId, payload);
        break;
      case "Authorize":
        ocppAuthorization.handleAuthorizeResponse(messageId, payload);
        break;
      // Add other response handlers as needed
    }
    delete pendingRequests[messageId];
  }
}

// Connection status management
function updateConnectionStatus(status, isConnected) {
  const statusElement = document.getElementById('connectionStatus');
  statusElement.textContent = status;
  let statusClass = 'bg-secondary';
  if (isConnected) {
    statusClass = 'bg-success';
  } else if (status === 'Connecting...') {
    statusClass = 'bg-warning';
  }
  statusElement.className = 'status-badge ' + statusClass;
}

// Export functions for use in other modules
window.ocppCore = {
  connectToServer,
  disconnectFromServer,
  sendRequest,
  sendResponse,
  logMsg,
  updateConnectionStatus,
  get ws() { return ws; } // Expose ws variable
}; 