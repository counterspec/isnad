

# Inscription Fee Calculation Specification

## Overview
This document outlines the fee calculation mechanism for on-chain inscriptions on the [counterspec/isnad] network. The fee structure consists of a base fee plus a size-based multiplier.

## Fee Components

### Base Fee
- **Amount**: 0.001 $ISNAD tokens
- **Purpose**: Covers the minimum cost for processing an inscription transaction

### Size-Based Multiplier
- **Formula**: `(inscription_size_in_KB * 0.0001) $ISNAD tokens`
- **Range**: Multiplier applies to inscriptions larger than 1KB
- **Maximum Size**: 100KB (inscriptions larger than this will be rejected)

## Calculation Example

For an inscription of 5KB:
```
Total Fee = Base Fee + (Size Multiplier)
Total Fee = 0.001 $ISNAD + (5KB * 0.0001 $ISNAD/KB)
Total Fee = 0.001 $ISNAD + 0.0005 $ISNAD
Total Fee = 0.0015 $ISNAD tokens
```

## Fee Structure Table

| Inscription Size | Fee Calculation                     |
|------------------|-------------------------------------|
| ≤ 1KB            | 0.001 $ISNAD (base fee only)        |
| 2KB              | 0.001 + (1 * 0.0001) = 0.0011 $ISNAD |
| 5KB              | 0.001 + (4 * 0.0001) = 0.0015 $ISNAD |
| 100KB (max)      | 0.001 + (99 * 0.0001) = 0.0109 $ISNAD |

## Implementation Notes
- Fees are calculated at transaction submission time
- Fee estimation tools should be provided in the wallet interface
- Dynamic fee adjustments may be implemented for network congestion
- All fees are denominated in $ISNAD tokens

