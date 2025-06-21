// OCPP Configuration Functionality
// Handles SetConfiguration and related configuration management

function handleSetConfiguration(messageId, payload) {
  const response = { configurationKey: [] };
  let success = true;

  // Standard OCPP 1.6 configuration keys
  const standardKeys = {
    'AllowOfflineTxForUnknownId': { type: 'boolean' },
    'AuthorizationCacheEnabled': { type: 'boolean' },
    'AuthorizationCacheLifetime': { type: 'integer' },
    'AuthorizeRemoteTxRequests': { type: 'boolean' },
    'ClockAlignedDataInterval': { type: 'integer' },
    'ConnectionTimeOut': { type: 'integer' },
    'ConnectorPhaseRotation': { type: 'string' },
    'ConnectorPhaseRotationMaxLength': { type: 'integer' },
    'GetConfigurationMaxKeys': { type: 'integer' },
    'HeartbeatInterval': { type: 'integer' },
    'LocalAuthorizeOffline': { type: 'boolean' },
    'LocalPreAuthorize': { type: 'boolean' },
    'MeterValueAlignedData': { type: 'string' },
    'MeterValueAlignedDataMaxLength': { type: 'integer' },
    'MeterValueSampledData': { type: 'string' },
    'MeterValueSampledDataMaxLength': { type: 'integer' },
    'MinimumStatusDuration': { type: 'integer' },
    'NumberOfConnectors': { type: 'integer' },
    'ResetRetries': { type: 'integer' },
    'StopTransactionMaxMeterValues': { type: 'integer' },
    'StopTransactionOnEVSideDisconnect': { type: 'boolean' },
    'StopTransactionOnInvalidId': { type: 'boolean' },
    'StopTxnAlignedData': { type: 'string' },
    'StopTxnAlignedDataMaxLength': { type: 'integer' },
    'StopTxnSampledData': { type: 'string' },
    'StopTxnSampledDataMaxLength': { type: 'integer' },
    'TransactionMessageAttempts': { type: 'integer' },
    'TransactionMessageRetryInterval': { type: 'integer' },
    'UnlockConnectorOnEVSideDisconnect': { type: 'boolean' },
    'WebSocketPingInterval': { type: 'integer' },
    'LocalAuthListEnabled': { type: 'boolean' },
    'LocalAuthListMaxLength': { type: 'integer' },
    'SendLocalListMaxLength': { type: 'integer' },
    'ReserveConnectorZeroSupported': { type: 'boolean' },
    'ChargeProfileMaxStackLevel': { type: 'integer' },
    'ChargingScheduleAllowedChargingRateUnit': { type: 'string' },
    'ChargingScheduleMaxPeriods': { type: 'integer' },
    'ConnectorSwitch3to1PhaseSupported': { type: 'boolean' },
    'MaxChargingProfilesInstalled': { type: 'integer' }
  };

  for (const [key, value] of Object.entries(payload)) {
    try {
      if (!standardKeys[key]) {
        response.configurationKey.push({ key, status: "NotSupported" });
        success = false;
        continue;
      }

      const config = standardKeys[key];
      let parsedValue;
      let isValid = true;

      switch (config.type) {
        case 'boolean':
          parsedValue = value.toLowerCase() === 'true';
          break;
        case 'integer':
          parsedValue = parseInt(value);
          isValid = !isNaN(parsedValue);
          break;
        case 'string':
          parsedValue = value;
          break;
      }

      if (!isValid) {
        response.configurationKey.push({ key, status: "Rejected" });
        success = false;
        continue;
      }

      // Store the configuration value
      localStorage.setItem(`ocpp_config_${key}`, value);
      response.configurationKey.push({ key, status: "Accepted" });

      // If NumberOfConnectors is updated, send status notifications for all connectors
      if (key === 'NumberOfConnectors') {
        const numberOfConnectors = parseInt(value);
        for (let i = 0; i <= numberOfConnectors; i++) {
          const status = i === 0 ? "Available" : "Unavailable";
          ocppStatus.sendStatusNotification(i, status);
        }
      }

    } catch (e) {
      response.configurationKey.push({ key, status: "Rejected" });
      success = false;
    }
  }

  ocppCore.sendResponse(messageId, response);
  return success;
}

// Export functions for use in other modules
window.ocppConfiguration = {
  handleSetConfiguration
}; 