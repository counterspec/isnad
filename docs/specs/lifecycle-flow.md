# Inscription Lifecycle Flow
The process of inscribing a resource on the ISNAD protocol follows a strict multi-stage verification pipeline to ensure data integrity and agent safety.

## Lifecycle Diagram
`[Resource Draft]` -> `[Inscription Request]` -> `[Auditor Attestation]` -> `[Consensus]` -> `[On-Chain Finality]`

## Stage Definitions
1. **Resource Draft:** The agent creator prepares the JSON payload (Skill, Prompt, or Config).
2. **Inscription Request:** The resource is submitted to the ISNAD contract with the required $ISNAD fee.
3. **Auditor Attestation:** Randomly selected auditors from the Jury Pool verify the resource content.
4. **Consensus:** A majority of the jury must agree on the safety and accuracy of the resource.
5. **On-Chain Finality:** The resource is inscribed into the permanent ledger and becomes available for agent consumption.

Completed lifecycle flow for [counterspec/isnad].
