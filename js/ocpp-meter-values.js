// OCPP Meter Values Functionality
// Handles MeterValues requests with proper context

function sendMeterValuesWithContext(context) {
  if (!window.ocppTransactions || !window.ocppTransactions.transactionId) return;
  
  // Get base values
  const baseVoltage = parseInt(document.getElementById('voltage').value);
  const baseCurrent = parseInt(document.getElementById('current').value);
  const baseFrequency = parseInt(document.getElementById('frequency').value);
  const basePowerFactor = parseFloat(document.getElementById('powerFactor').value);
  
  // Calculate actual values with variations
  const actualVoltage = simulation.getVoltageVariation(baseVoltage);
  const actualCurrent = simulation.getCurrentVariation(baseCurrent);
  const actualFrequency = simulation.getFrequencyVariation(baseFrequency);
  const actualPowerFactor = simulation.getPowerFactorVariation(basePowerFactor);
  
  // Calculate reactive and apparent power
  const activePower = (window.simulation ? window.simulation.currentPower : 0) * 1000; // Convert to W
  const reactivePower = activePower * Math.sqrt(1 - Math.pow(actualPowerFactor, 2));
  const apparentPower = activePower / actualPowerFactor;
  
  ocppCore.sendRequest("MeterValues", {
    connectorId: 1,
    transactionId: window.ocppTransactions.transactionId,
    meterValue: [{
      timestamp: new Date().toISOString(),
      context: context,
      sampledValue: [
        { 
          value: (window.simulation ? window.simulation.meterValue : 0).toFixed(0),
          measurand: "Energy.Active.Import.Register",
          unit: "Wh"
        },
        {
          value: activePower.toFixed(0),
          measurand: "Power.Active.Import",
          unit: "W"
        },
        {
          value: reactivePower.toFixed(0),
          measurand: "Power.Reactive.Import",
          unit: "var"
        },
        {
          value: apparentPower.toFixed(0),
          measurand: "Power.Apparent.Import",
          unit: "VA"
        },
        {
          value: actualCurrent.toFixed(1),
          measurand: "Current.Import",
          unit: "A"
        },
        {
          value: actualVoltage.toFixed(1),
          measurand: "Voltage",
          unit: "V"
        },
        {
          value: actualFrequency.toFixed(2),
          measurand: "Frequency",
          unit: "Hz"
        },
        {
          value: actualPowerFactor.toFixed(2),
          measurand: "Power.Factor",
          unit: "Percent"
        },
        {
          value: (window.simulation ? window.simulation.currentSoc : 0).toFixed(1),
          measurand: "SoC",
          unit: "Percent"
        }
      ]
    }]
  });
}

function startMeterValues() {
  if (!window.simulation || window.simulation.connectorStatus !== 'Charging') {
    alert('Connector must be in Charging status to start meter values');
    return;
  }
  
  if (window.simulation) {
    window.simulation.targetPower = window.simulation.chargingPower;
    window.simulation.currentPower = 0;
    window.simulation.lastMeterUpdate = Date.now();
  }
  
  // Start UI updates at 100ms intervals
  if (window.simulation) {
    window.simulation.uiUpdateInterval = setInterval(simulation.updateUIValues, 100);
  }
  
  // Start meter value updates at configured interval
  if (window.simulation) {
    window.simulation.chargingInterval = setInterval(() => {
      // Get base values
      const baseVoltage = parseInt(document.getElementById('voltage').value);
      const baseCurrent = parseInt(document.getElementById('current').value);
      const baseFrequency = parseInt(document.getElementById('frequency').value);
      const basePowerFactor = parseFloat(document.getElementById('powerFactor').value);
      
      // Calculate actual values with variations
      const actualVoltage = simulation.getVoltageVariation(baseVoltage);
      const actualCurrent = simulation.getCurrentVariation(baseCurrent);
      const actualFrequency = simulation.getFrequencyVariation(baseFrequency);
      const actualPowerFactor = simulation.getPowerFactorVariation(basePowerFactor);
      
      // Calculate reactive and apparent power
      const activePower = (window.simulation ? window.simulation.currentPower : 0) * 1000; // Convert to W
      const reactivePower = activePower * Math.sqrt(1 - Math.pow(actualPowerFactor, 2));
      const apparentPower = activePower / actualPowerFactor;
      
      // Update graph with all values
      uiGraphs.updateGraph(new Date().toISOString(), {
        active: activePower,
        reactive: reactivePower,
        apparent: apparentPower,
        voltage: actualVoltage,
        current: actualCurrent,
        energy: window.simulation ? window.simulation.meterValue : 0,
        soc: window.simulation ? window.simulation.currentSoc : 0
      });
      
      sendMeterValuesWithContext("Sample.Periodic");
    }, (window.simulation ? window.simulation.meterInterval : 30) * 1000);
  }
}

// Export functions for use in other modules
window.ocppMeterValues = {
  sendMeterValuesWithContext,
  startMeterValues
}; 