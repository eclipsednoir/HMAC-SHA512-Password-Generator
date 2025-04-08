# **Entropy-Based Truncation and Diversity-Ensured Password Generation Using HMAC-SHA512 and Base64 Encoding**

### Author: [Your Name or Alias]  
**Date of Original Publication:** April 8th, 2025  
**Repository:** https://github.com/eclipsednoir/HMAC-SHA512-Password-Generator
**License:** MIT  
**Type of Document:** Defensive Publication / Technical Disclosure  

---

## **Abstract**

This document describes a method for generating deterministic, high-entropy passwords by combining HMAC-SHA512 hashing with Base64 encoding. To produce fixed-length outputs while preserving complexity, the hash is segmented and each segment is scored using an entropy-based heuristic that evaluates character class diversity and rarity. The highest-ranking segments are selected for inclusion, and the final output is modified as needed to ensure it includes characters from at least four distinct categories: lowercase letters, uppercase letters, digits, and special characters. The entire process is deterministic and reproducible from the same inputs.

---

## **System Overview**

### **Inputs:**
- **Password Base:** A user-provided text string.
- **Secret Key:** A second string used as the key in HMAC.
- **Optional Truncation Toggle:** Boolean input determining if the output should be reduced to a specified length.
- **Truncation Length Selector:** Modal UI control allowing the user to pick output lengths (e.g., 16, 24, 32 chars).

### **Process Flow:**
1. The HMAC-SHA512 hash is computed from the password base and secret key.
2. The result is Base64-encoded into an 88-character string.
3. The encoded string is divided into 4-character segments (total of 22).
4. Each segment is scored using a custom entropy function.
5. Segments with the highest scores are selected based on the desired output length.
6. The first and last segments are always included for stability and determinism.
7. If character class diversity is insufficient, selected characters are replaced in a controlled way to guarantee at least one character of each type (lowercase, uppercase, digit, special).
8. Final output is written to an output field.

---

## **Entropy Scoring Algorithm**

Each 4-character segment is scored as follows:

1. **Character Type Classification:**
   - `a-z`: Type 1
   - `A-Z`: Type 2
   - `0-9`: Type 3
   - `[^a-zA-Z0-9]`: Type 4 (special chars)

2. **Entropy Score =**  
   - `10 × Number of Unique Character Types in Segment`
   - Plus: For each type `t` present, add  
     `(Number of characters of type t) × (10 / overall frequency of type t in the full base64 string)`

This approach favors segments that contain multiple character types *and* contain rarer types more frequently.

---

## **Truncation Selection Logic**

Given a required output length (e.g., 24 chars), the number of segments needed is calculated as `length / 4`.

- The **first segment** is always included.
- The **last segment** is always included.
- The remaining segments are selected by descending entropy score.

Example: For 24-character output, select 6 segments = 1 (start) + 1 (end) + top 4 entropy segments.

---

## **Character Diversity Enforcement**

After truncation, the output is validated for diversity:

- If any of the 4 character classes is missing, the most common class in the output is identified.
- A character from the overrepresented class is replaced with a character from the missing class.
- Replacement characters are standard and predictable: `'a'`, `'A'`, `'1'`, `'/'`.

This ensures every password contains at least:
- One lowercase letter
- One uppercase letter
- One digit
- One special character

---

## **Example Execution**

### Inputs:
- Password Base: `user@example.com`
- Secret Key: `hunter2`
- Truncation Enabled: Yes
- Desired Length: 24

### Result:
- HMAC-SHA512 (Base64): `zdMZ...`
- Segmented into 22 × 4-character groups
- Entropy scores calculated per segment
- Selected segments: `[0, 3, 5, 7, 10, 21]`
- Post-processing ensures full character diversity
- Final Output: `zdMZ8pQzZ/tAqLvE1XHa5N/3`

---

## **User Interface (UI) Design Notes**

- UI includes modal dialog for truncation length selection with visual feedback.
- Input validation is handled inline with DOM-based error messages.
- Copy-to-clipboard function is triggered via `execCommand`.

---

## **Legal Notes**

This document serves as a **defensive publication**, establishing **prior art** on the following:
- Entropy-scored truncation of a deterministic hash
- Segment selection based on statistical analysis
- Forced diversity modification in Base64-derived passwords
- Modal-driven length control for password generators

This functionality is released under the MIT License, and is intended to **prevent any future software patents** from being granted on these ideas or their derivatives.

---

## **Conclusion**

The techniques described above are original, useful, and novel within the scope of password generation and secure deterministic hashing. This disclosure is made to protect open use of the approach in the software community, and to prevent future misuse of patent systems to restrict access to these methods.
