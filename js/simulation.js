// Simulation Functionality
// Handles the charging simulation, power calculations, and electrical measurements

let meterValue = 0;
let chargingInterval = null;
let currentSoc = 20;
let batteryCapacity = 50; // kWh
let chargingPower = 30; // kW
let meterInterval = 30; // seconds
let isPluggedIn = false;
let connectorStatus = "Unavailable";
let currentPower = 0;
let targetPower = 0;
let powerRampRate = chargingPower*0.2; // kW per interval
let lastMeterUpdate = Date.now();
let uiUpdateInterval = null;

// OCPP 1.6 compliant measurement types and units
const OCPP_MEASUREMENTS = {
  Energy: {
    Active: {
      Import: {
        Register: { unit: "Wh", multiplier: 1 },
        Interval: { unit: "Wh", multiplier: 1 }
      },
      Export: {
        Register: { unit: "Wh", multiplier: 1 },
        Interval: { unit: "Wh", multiplier: 1 }
      }
    },
    Reactive: {
      Import: {
        Register: { unit: "varh", multiplier: 1 },
        Interval: { unit: "varh", multiplier: 1 }
      },
      Export: {
        Register: { unit: "varh", multiplier: 1 },
        Interval: { unit: "varh", multiplier: 1 }
      }
    }
  },
  Power: {
    Active: {
      Import: { unit: "W", multiplier: 1 },
      Export: { unit: "W", multiplier: 1 }
    },
    Reactive: {
      Import: { unit: "var", multiplier: 1 },
      Export: { unit: "var", multiplier: 1 }
    },
    Apparent: {
      Import: { unit: "VA", multiplier: 1 },
      Export: { unit: "VA", multiplier: 1 }
    }
  },
  Current: {
    Import: { unit: "A", multiplier: 0.1 },
    Export: { unit: "A", multiplier: 0.1 },
    Offered: { unit: "A", multiplier: 0.1 }
  },
  Voltage: { unit: "V", multiplier: 0.1 },
  Frequency: { unit: "Hz", multiplier: 0.01 },
  Temperature: { unit: "Celsius", multiplier: 0.1 },
  SoC: { unit: "Percent", multiplier: 0.1 }
};

function getRandomVariation(baseValue, percentage) {
  const variation = baseValue * (percentage / 100);
  return baseValue + (Math.random() * variation * 2 - variation);
}

function getVoltageVariation(baseVoltage) {
  // Voltage typically varies by ±2%
  return getRandomVariation(baseVoltage, 2);
}

function getCurrentVariation(baseCurrent) {
  // Current typically varies by ±1%
  return getRandomVariation(baseCurrent, 1);
}

function getFrequencyVariation(baseFrequency) {
  // Frequency typically varies by ±0.1%
  return getRandomVariation(baseFrequency, 0.1);
}

function getPowerFactorVariation(basePowerFactor) {
  // Power factor typically varies by ±0.02
  return Math.max(0.8, Math.min(1.0, basePowerFactor + (Math.random() * 0.04 - 0.02)));
}

function calculatePowerRamp() {
  const now = Date.now();
  const timeDiff = (now - lastMeterUpdate) / 1000; // Convert to seconds
  
  if (currentPower < targetPower) {
    currentPower = Math.min(targetPower, currentPower + (powerRampRate * timeDiff));
  } else if (currentPower > targetPower) {
    currentPower = Math.max(targetPower, currentPower - (powerRampRate * timeDiff));
  }
  
  lastMeterUpdate = now;
  return currentPower;
}

function updateUIValues() {
  // Calculate actual power with ramping
  const actualPower = calculatePowerRamp();
  
  // Calculate energy added in this interval (Wh)
  const energyAdded = (actualPower * 1000) * (0.1 / 3600); // Update every 100ms
  meterValue += energyAdded;
  
  // Update SoC
  currentSoc += (energyAdded / (batteryCapacity * 1000)) * 100;
  if (currentSoc > 100) currentSoc = 100;
  
  // Get base values
  const baseVoltage = parseInt(document.getElementById('voltage').value);
  const baseCurrent = parseInt(document.getElementById('current').value);
  const baseFrequency = parseInt(document.getElementById('frequency').value);
  const basePowerFactor = parseFloat(document.getElementById('powerFactor').value);
  
  // Calculate actual values with variations
  const actualVoltage = getVoltageVariation(baseVoltage);
  const actualCurrent = getCurrentVariation(baseCurrent);
  const actualFrequency = getFrequencyVariation(baseFrequency);
  const actualPowerFactor = getPowerFactorVariation(basePowerFactor);
  
  // Calculate reactive and apparent power
  const activePower = actualPower * 1000; // Convert to W
  const reactivePower = activePower * Math.sqrt(1 - Math.pow(actualPowerFactor, 2));
  const apparentPower = activePower / actualPowerFactor;
  
  // Update gauges
  if (powerGauge) {
    uiGauges.updateGauge(powerGauge, actualPower, chargingPower);
    document.getElementById('powerGaugeValue').textContent = actualPower.toFixed(2) + ' kW';
  }
  
  if (socGauge) {
    uiGauges.updateGauge(socGauge, currentSoc, 100);
    document.getElementById('socGaugeValue').textContent = currentSoc.toFixed(1) + '%';
  }
  
  if (voltageGauge) {
    uiGauges.updateGauge(voltageGauge, actualVoltage, 400);
    document.getElementById('voltageGaugeValue').textContent = actualVoltage.toFixed(1) + ' V';
  }
  
  if (currentGauge) {
    uiGauges.updateGauge(currentGauge, actualCurrent, 400);
    document.getElementById('currentGaugeValue').textContent = actualCurrent.toFixed(1) + ' A';
  }
}

function reinitializeUI() {
  // Reinitialize graph and gauges if they don't exist
  if (!meterGraph) {
    uiGraphs.initGraph();
  }
  if (!powerGauge || !voltageGauge || !currentGauge || !socGauge) {
    uiGauges.initGauges();
  }
}

// Export functions for use in other modules
window.simulation = {
  getRandomVariation,
  getVoltageVariation,
  getCurrentVariation,
  getFrequencyVariation,
  getPowerFactorVariation,
  calculatePowerRamp,
  updateUIValues,
  reinitializeUI,
  // Expose variables for other modules
  get isPluggedIn() { return isPluggedIn; },
  set isPluggedIn(value) { isPluggedIn = value; },
  get connectorStatus() { return connectorStatus; },
  set connectorStatus(value) { connectorStatus = value; },
  get chargingInterval() { return chargingInterval; },
  set chargingInterval(value) { chargingInterval = value; },
  get uiUpdateInterval() { return uiUpdateInterval; },
  set uiUpdateInterval(value) { uiUpdateInterval = value; },
  get batteryCapacity() { return batteryCapacity; },
  set batteryCapacity(value) { batteryCapacity = value; },
  get currentSoc() { return currentSoc; },
  set currentSoc(value) { currentSoc = value; },
  get chargingPower() { return chargingPower; },
  set chargingPower(value) { chargingPower = value; },
  get targetPower() { return targetPower; },
  set targetPower(value) { targetPower = value; },
  get meterInterval() { return meterInterval; },
  set meterInterval(value) { meterInterval = value; },
  get meterValue() { return meterValue; },
  set meterValue(value) { meterValue = value; },
  get currentPower() { return currentPower; },
  set currentPower(value) { currentPower = value; }
}; 