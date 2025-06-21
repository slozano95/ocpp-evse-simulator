// OCPP Heartbeat Functionality
// Handles periodic heartbeat messages

let heartbeatInterval = null;

function sendHeartbeat() {
  ocppCore.sendRequest("Heartbeat", {});
}

function startHeartbeat() {
  // Clear any existing heartbeat interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  // Get heartbeat interval from configuration or use default (60 seconds)
  const heartbeatIntervalSeconds = parseInt(localStorage.getItem('ocpp_config_HeartbeatInterval')) || 60;
  
  // Send initial heartbeat
  sendHeartbeat();
  
  // Set up periodic heartbeat
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendHeartbeat();
    }
  }, heartbeatIntervalSeconds * 1000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Export functions for use in other modules
window.ocppHeartbeat = {
  sendHeartbeat,
  startHeartbeat,
  stopHeartbeat
}; 