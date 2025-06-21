// UI Gauges Functionality
// Handles the gauge displays and updates

let powerGauge = null;
let voltageGauge = null;
let currentGauge = null;
let socGauge = null;

function initGauges() {
  // Clean up existing gauges
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

  // Power Gauge
  const powerCtx = document.getElementById('powerGauge').getContext('2d');
  powerGauge = new Chart(powerCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, chargingPower],
        backgroundColor: ['#FF5722', '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });

  // SoC Gauge
  const socCtx = document.getElementById('socGauge').getContext('2d');
  socGauge = new Chart(socCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#FF5722', '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });

  // Voltage Gauge
  const voltageCtx = document.getElementById('voltageGauge').getContext('2d');
  voltageGauge = new Chart(voltageCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 400],
        backgroundColor: ['#FF5722', '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });

  // Current Gauge
  const currentCtx = document.getElementById('currentGauge').getContext('2d');
  currentGauge = new Chart(currentCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 400],
        backgroundColor: ['#FF5722', '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });
}

function updateGauge(gauge, value, maxValue) {
  if (!gauge) return;
  
  // Update the gauge data
  gauge.data.datasets[0].data = [value, maxValue - value];
  
  // Update the gauge color based on the value
  const percentage = value / maxValue;
  let color;
  if (percentage < 0.5) {
    color = '#FF5722'; // Red for low values
  } else if (percentage < 0.8) {
    color = '#FFC107'; // Yellow for medium values
  } else {
    color = '#4CAF50'; // Green for high values
  }
  gauge.data.datasets[0].backgroundColor = [color, '#E0E0E0'];
  
  gauge.update();
}

function resetGauges() {
  // Reset power gauge to 0
  if (powerGauge) {
    updateGauge(powerGauge, 0, window.simulation ? window.simulation.chargingPower : 30);
    document.getElementById('powerGaugeValue').textContent = '0.00 kW';
  }
  
  // Reset voltage gauge to 0
  if (voltageGauge) {
    updateGauge(voltageGauge, 0, 400);
    document.getElementById('voltageGaugeValue').textContent = '0.0 V';
  }
  
  // Reset current gauge to 0
  if (currentGauge) {
    updateGauge(currentGauge, 0, 400);
    document.getElementById('currentGaugeValue').textContent = '0.0 A';
  }
  
  // Note: SoC gauge should not be reset as it represents the vehicle's state
}

function updatePlugStatus(status) {
  const statusElement = document.getElementById('plugStatus');
  statusElement.textContent = status;
  statusElement.className = 'badge ' + (status === 'Connected' ? 'bg-success' : 'bg-danger');
  if (window.simulation) {
    window.simulation.isPluggedIn = status === 'Connected';
  }
  updatePlugToggleButton();
  updateSessionButtons();
}

function updatePlugToggleButton() {
  const toggleBtn = document.getElementById('plugToggleBtn');
  if (window.simulation && window.simulation.isPluggedIn) {
    toggleBtn.textContent = 'Plug Out';
    toggleBtn.className = 'btn btn-outline-danger';
  } else {
    toggleBtn.textContent = 'Plug In';
    toggleBtn.className = 'btn btn-outline-primary';
  }
}

function updateSessionButtons() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (!window.ocppCore || !window.ocppCore.ws || window.ocppCore.ws.readyState !== WebSocket.OPEN) {
    // Not connected
    startBtn.disabled = true;
    stopBtn.disabled = true;
    startBtn.classList.remove('btn-success');
    startBtn.classList.add('btn-info');
    return;
  }
  
  if (window.simulation && window.simulation.chargingInterval) {
    // Session is active
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startBtn.classList.remove('btn-success');
    startBtn.classList.add('btn-info');
    stopBtn.classList.remove('btn-warning');
    stopBtn.classList.add('btn-danger');
  } else {
    // No active session
    startBtn.disabled = !(window.simulation && window.simulation.isPluggedIn) || (window.simulation && window.simulation.connectorStatus !== 'Preparing');
    stopBtn.disabled = true;
    startBtn.classList.remove('btn-info');
    startBtn.classList.add('btn-success');
    stopBtn.classList.remove('btn-danger');
    stopBtn.classList.add('btn-warning');
  }
}

// Export functions for use in other modules
window.uiGauges = {
  initGauges,
  updateGauge,
  resetGauges,
  updatePlugStatus,
  updatePlugToggleButton,
  updateSessionButtons
}; 