# NAOS Signal Engine - Part 10 (Calibration Foundation V1)

## 1. Overview
Part 10 establishes the backend `CALIBRATION_FOUNDATION_V1`. It creates the canonical schema for capturing future interactions to eventually validate or iterate on the deterministic `DESIGNED_V1` methodology pipeline (Parts 7, 8, and 9).

**NO EMPIRICAL CALIBRATION HAS OCCURRED YET.**
The system relies on designed logic. This module strictly defines the future feedback architecture.

## 2. Methodology Provenance
Every captured interaction (a `CalibrationObservation`) intrinsically references an immutable `MethodologySnapshot` containing the active versions:
- `DOMAIN_PROJECTION_V1`
- `DOMAIN_AGGREGATION_V1`
- `ACTION_ROUTING_V1`

This ensures that historical observations are never silently rewritten or misinterpreted if routing matrices or saturation limits change in a V2 deployment.

## 3. Privacy & Semantic Boundaries
- **No Personal Data:** Observations only contain an `accountScopedSubject` ID. No raw conversations, birth dates, or intention text are required or permitted in the calibration model.
- **No Secret Bleed:** Exact routing coefficients or thresholds are never serialized into an observation.
- **Feedback vs. Telemetry:** The schema rigorously segregates `EXPLICIT_FEEDBACK` (e.g., "USER_HELPFUL") from `BEHAVIORAL_EVENT` (e.g., "ROUTE_OPENED"). 
- **No Automatic Retrospective Validation:** Even if an `ACTION_COMPLETED` behavioral event is fired, it is explicitly NOT equated to symbolic event certainty, prediction success, or retroactively validating that an astrological signal caused an event.
- **No Auto-Tuning:** There is zero automatic recipe mutation. Observations can only trigger a state of `ELIGIBLE_FOR_REVIEW` for future offline analysis once sufficient data is amassed.

## 4. State Constraints
The `CalibrationRegistry` enforces that the current implementation is strictly labeled:
- `coefficientStatus = 'DESIGNED_V1'`
- `empiricalStatus = 'NOT_CALIBRATED'`

These fields cannot transition computationally based merely on an influx of tracking events.
