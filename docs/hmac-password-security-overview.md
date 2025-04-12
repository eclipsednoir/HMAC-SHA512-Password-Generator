# HMAC-SHA512 Password Generator: Security and Cryptography Overview

This document outlines the cryptographic properties, security design, and mathematical strength behind the HMAC-SHA512-based password generation method used in the standalone HTML tool and browser extension.

---

## Core Concept

The generator creates deterministic, high-entropy passwords using the following pattern:

```
password = Truncate(Base64(HMAC_SHA512(base, key)))
```

- **Base**: A service-unique string (e.g. `github`, `protonmail`)
- **Key**: A user-chosen secret
- The output is Base64-encoded and truncated to a user-defined length (e.g. 24 characters)

No data is stored or transmitted. Everything happens in volatile memory, and the same inputs always yield the same output.

---

## Why HMAC-SHA512?

HMAC-SHA512 provides the following security properties:

- **One-way**: The output cannot be reversed to retrieve inputs
- **Collision-resistant**: Different input pairs will almost certainly produce different outputs
- **Keyed hashing**: Unlike plain hashing, HMAC uses a secret key in its construction, making precomputation attacks infeasible

By using HMAC, the system protects even against an attacker who might know part of the input (e.g., a common service name).

---

## Base64 Encoding and Truncation

The full HMAC-SHA512 output (512 bits) is Base64-encoded into an 88-character string. The generator truncates this string to a smaller length (commonly 24 characters) while maintaining:

- **Determinism**
- **High entropy**
- **Character diversity**

Truncation is done using an entropy-aware segment selection algorithm that:
- Splits the Base64 string into 22 segments of 4 characters each
- Scores each segment based on diversity and rarity
- Selects the highest-entropy segments while preserving the first and last
- Ensures the final output includes uppercase, lowercase, digits, and symbols

---

## Brute-Forcing the Output: Mathematically Infeasible

Example: 24-character output (22 real characters + 2 padding)

If all 22 characters use the full Base64 character set (64 symbols), total combinations are:

```
64^22 = 2^132 ≈ 5.44 × 10^39
```

This represents over 131 bits of entropy.

Even with 1 million GPUs running at 1 billion guesses per second (10^15 guesses/sec), it would take:

```
5.44 × 10^39 / 10^15 = 5.44 × 10^24 seconds ≈ 1.7 × 10^17 years
```

That’s over 12 million times the age of the universe. Brute-forcing this is effectively impossible.

---

## Brute-Forcing the Inputs: Still Extremely Hard

To derive a password, an attacker needs the correct pair of inputs: `base` and `key`. Even if they know the algorithm and the output, they must:

- Guess both values simultaneously
- From large potential input spaces
- Without any feedback unless both are correct

This forms a **combinatorial search problem** with no partial success signals. For example:

```
10^6 possible base inputs × 10^12 possible secret keys = 10^18 combinations
```

Even this very modest estimate puts brute-force well beyond practical limits.

Additionally:
- HMAC does not leak partial correctness
- Truncation prevents any output-side pattern matching
- No rainbow tables can be built due to the secret key being required

---

## Using HMAC-SHA512 to Derive the Secret Key: Pre-Hardened Secret

A user can significantly increase security by **deriving the Secret Key** itself using HMAC-SHA512. Instead of typing a static secret key directly, the user first generates it by combining two separate inputs via HMAC.

### Example:

Let:
- `Input 1 = something memorable or user-specific`
- `Input 2 = something secret (e.g., passphrase or PIN)`

Then:

```
Secret Key = HMAC_SHA512(Input 1, Input 2)
Final Password = HMAC_SHA512("ServiceName", Secret Key)
```

This approach increases the effective complexity of the secret input, while still allowing the final password to be generated deterministically.

### Benefits:

- **Massively expands the input space**:  
  The attacker must correctly guess both `Input 1` and `Input 2` to even reach the Secret Key.

- **Full 512-bit key material**:  
  The derived key is 512 bits in size, encoded as an 88-character Base64 string — cryptographically strong by default.

- **No clues from partial guesses**:  
  Incorrect input combinations yield completely unrelated outputs, with no indication of proximity to the correct answer.

- **Works seamlessly with the generator**:  
  The user pastes the derived Secret Key into the tool as usual. No changes to the generator are required.

- **Ideal for memory-based workflows**:  
  Users can remember two simpler inputs rather than a long key, while still benefiting from strong derived entropy.

---

### Summary

This method turns the Secret Key into a **derived cryptographic value**, making brute-force attacks even less viable. It requires the attacker to guess both independent inputs correctly, and offers extremely high entropy without needing to store anything.

> **Final formula becomes:**
>
> `Password = HMAC_SHA512(ServiceName, HMAC_SHA512(Input 1, Input 2))`

This small change dramatically increases security while preserving the generator’s portability, determinism, and offline operation.

---

## Known Output Samples Are Useless

Even if an attacker has 100 output samples (i.e., passwords used on known services), they:

- Cannot reverse them to determine the key or base
- Cannot derive new outputs without knowing the correct inputs
- Cannot correlate or link outputs to infer anything about internal logic
- Cannot brute-force outputs (space is too large)
- Cannot brute-force inputs unless input spaces are trivial, which is avoidable

Knowing the tool or even the source code does **not** reduce the effective security.

---

## Summary of Security Properties

| Threat                        | Mitigation                                           |
|------------------------------|-------------------------------------------------------|
| Reverse-engineering output    | Impossible due to HMAC + truncation                  |
| Brute-forcing the password    | Requires infeasible time even with massive hardware  |
| Brute-forcing the inputs      | Requires simultaneous correct guesses, no feedback   |
| Known samples aiding attacks  | Doesn't help unless both inputs are known            |
| Leaking secrets through the app | No storage, no network, no persistence             |
| Clipboard sniffing            | Warned explicitly; outside threat model              |
| Reuse across services         | Prevented by unique base input per site              |

---

## Conclusion

This password generation method combines:

- HMAC-SHA512 (cryptographically sound)
- Entropy-aware truncation
- No external dependencies
- Full transparency and auditability
- Optional key derivation chaining
- Offline, file-based execution

It offers extremely high practical and theoretical security for generating deterministic, strong, and site-unique passwords without storage or synchronization.
