# NAOS Signal Engine - Part 8 (Domain Aggregation V1)

## 1. Overview
Part 8 of the NAOS Signal Engine introduces `DOMAIN_AGGREGATION_V1`. It is responsible for consuming deterministic `DomainEvidence` emitted by Part 7 and collapsing it into an explicit `InternalDomainState`.

This process is a pure, deterministic, and fully server-side mathematical reduction. It isolates Activation intensity (Strength) from Directional character (Dominant Direction, Tension, Convergence), preventing mathematical contradictions (like opposing evidence cancelling out strength).

## 2. Core Separation of Metrics
*   **Strength:** Current temporal activation mass. Always strictly bounded `[0,1]` using an asymptotic/logistic diminishing returns limit per system. Never reduced by opposing directions.
*   **Structural Resonance:** Tracks long-term baseline affinity using `STRUCTURAL` scopes, strictly separated from temporal spikes.
*   **Evidence Coverage:** Ratio of successfully represented eligible systems (`Represented / AvailableEligible`).
*   **Source Availability:** Ratio of technically healthy systems (`AvailableEligible / Eligible`).
*   **Directional Convergence:** Alignment among strictly independent sources.
*   **Tension:** Meaningful contradiction between independent units.
*   **Ambiguity:** Intra-source uncertainty (e.g. MIXED records). Isolates internal source conflict from global Tension.

## 3. The Independence Model
Units are grouped uniquely by `sourceSystem:sourceId` prior to any aggregation.
*   **Generic & Personalized Reconciliation:** A specific (personalized) projection gracefully refines a generic projection within the same underlying unit group rather than artificially inflating the number of independent sources.

## 4. Public/Private Boundary & Core Recipe Secret
The exact aggregation logic (coefficients, curves, limits) is `CORE_RECIPE_SECRET` and resides entirely within `server/src/modules/domainAggregation/internal`. 
**This is DESIGNED_V1 and is not empirically calibrated.**
*   None of the math is localized; everything relies on string literal enums.
*   There are 0 database writes, 0 LLM calls, and 0 runtime wired consumers in V1.
