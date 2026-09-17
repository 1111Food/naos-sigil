# NAOS Signal Engine - Part 9 (Action Routing V1)

## 1. Overview
Part 9 (`ACTION_ROUTING_V1`) evaluates the `InternalDomainState` generated in Part 8 alongside standard `PersonalContext` and deterministic flags (like Coherence and Active Protocol) to suggest behavioral alignment routes.

It answers: *Given the active domain context and its internal character, what kind of action helps the user respond best?*

**Crucially, Action Routing is NOT prediction.** It explicitly forbids language or semantics regarding probability, likelihood, event guarantees, success rates, or fatalistic behavior.

## 2. Canonical Action Taxonomy
Action types are language-agnostic enums focused on broad behavioral verbs:
*   `ACT`, `PREPARE`, `COMMUNICATE`, `LEARN`, `REGULATE`, `REFLECT`, `REVIEW`, `CONNECT`, `OBSERVE`.

These are intrinsically tied to specific verified `TargetSurface` components within the NAOS ecosystem (e.g., `TIME_MAP`, `SIGIL`, `SANCTUARY`, `LABORATORY`, `ORACLE`).

## 3. Dimensional Evaluation (Not Just Strength)
Routing is NOT determined strictly by signal `strength`. 

*   **Pacing:** Derived from `tension`, `ambiguity`, `coverage`, and `coherence`. High tension or low coherence shifts the pacing away from `DIRECT` to `MEASURED`, `GENTLE`, or `PAUSE_AND_REVIEW`.
*   **Priority:** Derived from `strength`, `contextualAlignment` (factual relevance from user context), and `structuralResonance` (long-term natal relevance).
*   **Action Type Context:** `tension`, `ambiguity`, and `dominantDirection` dynamically override the suggested action type. For instance, high tension shifts `ACTION_INITIATIVE` from `ACT` to `PREPARE` or `REVIEW`.

## 4. Safety & Boundary Principles
1.  **Business Safety:** Never routes to financial predictions or asset-buying signals. Focuses on planning, communicating, or reviewing.
2.  **Relationship Safety:** Never predicts cheating or breakups. Focuses on communication, observation, reflection, and connection.
3.  **Body Regulation Safety:** Wellness-oriented and strictly nonmedical. Routes to grounding, breathwork (`SANCTUARY`), and observation.

## 5. Implementation Status
*   **Methodology:** `ACTION_ROUTING_V1`
*   **Classification:** `DESIGNED_V1` (Deterministic, not empirically calibrated).
*   **Secrecy:** The `DOMAIN_ACTION_MATRIX` and `ROUTING_THRESHOLDS` are `CORE_RECIPE_SECRET` and strictly isolated to backend private scope. No Gemini decision-making is involved in routing. 
