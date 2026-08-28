# ANUSHRAWAN (अनुश्रवण) — Bharat Fleet Cargo Security & Telemetry

> **अनुश्रवण (Anushrawan)**: Continuous auditory and sensory surveillance / real-time monitoring.

Real-time cargo theft detection and highway fleet telemetry engineered for Bharat logistics using a dedicated 4-pillar hardware architecture:

## 4 Core Technical Components

1. **Load Cell (Weight Measuring)** — Multi-point chassis bed strain gauges detect progressive or sudden transit weight drops within 1.2 seconds.
2. **TPMS (Tire Pressure Monitoring)** — Real-time axle-wise tire pressure (PSI) and thermal tracking ensuring load balance and tamper detection.
3. **GSM Module (Communication)** — Industrial GSM telemetry uplink streaming sensor packets to fleet servers and receiving operator commands.
4. **Solenoid Valve (Fuel Control & Remote Immobilization)** — Inline solenoid valve in the truck's fuel pipe. In the case of a corrupt driver who refuses to stop the vehicle or diverts cargo, fleet operators remotely actuate the solenoid valve via GSM to safely shut off fuel flow and immobilize the truck.

## Key Capabilities

- **अभेद्य सुरक्षा (Impermeable Cargo Protection)** — Multi-point load cell sensors detect sudden transit weight drops within 1.2 seconds.
- **Tire Pressure & Axle Telemetry (TPMS)** — Per-tire pressure & temperature monitoring to detect load shifts, tire stress, and tampering.
- **GSM Highway Uplink** — Encrypted bidirectional GSM communication across Indian national corridors (NH-48, NH-44, NH-19, NE-4 Expressway).
- **Corrupt Driver Fuel Cut-Off (Solenoid Valve)** — Remote engine immobilization by isolating the fuel pipe via GSM.
- **Zero False-Alarm Dynamic Filtering** — Filter out ghat section tilt, speed-breaker shocks, and rough terrain vibrations.
- **Unified Fleet Ops Console** — Live alerts, load stability charts, TPMS gauges, and remote solenoid valve control.

## Development

```sh
npm install
npm run dev
```

The application runs locally on `http://localhost:5173`.

