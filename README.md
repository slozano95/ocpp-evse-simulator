# OCPP EVSE Simulator

A web-based OCPP 1.6 compliant Electric Vehicle Supply Equipment (EVSE) simulator that provides real-time visualization of charging parameters and supports both local and remote charging sessions.

## Live Demo
[Live Demo](https://slozano95.github.io/ocpp-evse-simulator/index.html)

## Features

### Real-time Monitoring
- **Live Gauges**: Visual representation of key charging parameters
  - Power (kW)
  - State of Charge (%)
  - Voltage (V)
  - Current (A)
- **Graph Visualization**: Historical data tracking for:
  - Active, Reactive, and Apparent Power
  - Voltage and Current
  - Energy Consumption
  - State of Charge

### OCPP 1.6 Compliance
- Supports standard OCPP 1.6 messages
- Implements BootNotification, StatusNotification, MeterValues
- Handles RemoteStartTransaction and RemoteStopTransaction
- Supports SetConfiguration for station configuration

### Charging Session Management
- **Local Control**:
  - Start/Stop charging sessions
  - Plug in/out simulation
  - Real-time status updates
- **Remote Control**:
  - Remote start/stop transaction support
  - Authorization handling
  - Transaction management

### Configuration Options
- **Station Settings**:
  - Charging power (1-350 kW)
  - Meter value interval (1-60 seconds)
  - Electrical measurements (voltage, current, frequency, power factor)
- **Vehicle Settings**:
  - Predefined vehicle profiles (Tesla, Nissan, VW, etc.)
  - Custom battery capacity
  - Initial State of Charge
  - ID Tag configuration
- **Station Configuration**:
  - Vendor and model information
  - Serial numbers
  - Firmware version
  - ICCID and IMSI
  - Meter type and serial

### URL Parameter Support
Configure the simulator through URL parameters:
```
http://localhost:5000/?power=50&voltage=400&current=125&frequency=60
```

Available parameters:
- `power`: Charging power in kW (1-350)
- `voltage`: Voltage in V (200-400)
- `current`: Current in A (0-400)
- `frequency`: Frequency in Hz (45-65)
- `powerFactor`: Power factor (0-1)
- `meterInterval`: Meter value interval in seconds (1-60)
- `initialSoc`: Initial state of charge in % (0-100)
- `vehicle`: Vehicle battery capacity in kWh
- `idTag`: ID Tag for authorization
- `server`: OCPP server URL
- `stationid`: Station ID


## Usage

1. **Connect to OCPP Server**:
   - Enter the OCPP server URL (default: wss://ocpp.chufi.co)
   - Enter the Station ID (default: T01)
   - Click "Connect"

2. **Configure Charging Parameters**:
   - Set charging power, voltage, current, and other electrical parameters
   - Select vehicle profile or set custom battery capacity
   - Configure initial state of charge

3. **Start Charging Session**:
   - Click "Plug In" to simulate vehicle connection
   - Click "Start Charging Session" to begin charging
   - Monitor real-time parameters in gauges and graph
   - Click "Stop Charging Session" to end charging

4. **Monitor Charging**:
   - Watch real-time updates in gauges
   - View historical data in the graph
   - Monitor WebSocket traffic in the log

## WebSocket Traffic

The simulator logs all WebSocket communication, showing:
- Outgoing messages (→)
- Incoming messages (←)
- Message content in JSON format

## Configuration Documentation

The simulator includes a built-in URL generator that helps create configuration URLs with all available parameters. This is useful for:
- Sharing specific configurations
- Quick setup of different scenarios
- Testing various charging parameters

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 