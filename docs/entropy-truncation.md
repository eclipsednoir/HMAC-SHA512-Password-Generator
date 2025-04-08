# Entropy-Based Truncation and Diversity-Ensured Password Generation Using HMAC-SHA512 and Base64 Encoding

**Author:** EclipsedNoir  
**Date of Original Publication:** April 8th, 2025  
**Repository:** [https://github.com/eclipsednoir/HMAC-SHA512-Password-Generator](https://github.com/eclipsednoir/HMAC-SHA512-Password-Generator)  
**License:** MIT  
**Type of Document:** Defensive Publication / Technical Disclosure

---

## Abstract

This document discloses a method for generating deterministic, high-entropy passwords by combining HMAC-SHA512 hashing with Base64 encoding. The process leverages a novel truncation algorithm that partitions the Base64 output into fixed segments, scores each segment using an entropy-based heuristic (which evaluates character class diversity and rarity), and selects high-scoring segments for the final truncated output. An additional diversity-enforcement step ensures that the resulting password incorporates characters from four distinct classes: lowercase letters, uppercase letters, digits, and special characters. The entire procedure is deterministic and reproducible when provided with identical inputs.

---

## System Overview

### Inputs
- **Password Base:** A user-provided text string.
- **Secret Key:** A text string used as the key for the HMAC.
- **Truncation Toggle:** A Boolean flag that enables or disables the truncation of the Base64-encoded string.
- **Truncation Length Selector:** A UI control that allows selection of the desired final output length (e.g., 16, 24, or 32 characters).

### Outputs
- **Final Password:** A high-entropy, deterministic password that meets the specified length and character complexity requirements.

### Dependencies
- **CryptoJS:** Employed for HMAC-SHA512 hashing and Base64 encoding.
- **Standard HTML/CSS/JavaScript:** Provides the user interface, including event handling, modal dialogs for configuration, inline error messages, and copy-to-clipboard functionality.

---

## Process Flow

1. **HMAC Computation:**  
   Compute an HMAC using SHA-512 over the provided Password Base with the Secret Key.

2. **Base64 Encoding:**  
   Encode the resulting hash into an 88-character Base64 string.

3. **Segmentation:**  
   Divide the Base64 string into 22 fixed-length segments (each 4 characters long).

4. **Entropy Scoring:**  
   Score each 4-character segment based on:
   - The diversity of character types it contains (lowercase, uppercase, digit, and special).
   - The relative frequency (rarity) of these character types in the entire Base64 string.

5. **Segment Selection:**  
   Determine the number of segments needed by dividing the desired output length by 4.  
   - Always include the first and last segments.
   - Select the remaining segments in order of descending entropy score.

6. **Character Diversity Enforcement:**  
   Validate the truncated output to ensure it contains at least one character from each of the four character classes.  
   - If any category is missing, replace a character from an overrepresented type with a predetermined substitute (`'a'` for lowercase, `'A'` for uppercase, `'1'` for digits, `'/'` for special characters).

7. **Output Generation:**  
   Concatenate the selected segments (and trim if necessary) to produce the final password.

---

## Entropy Scoring Algorithm

For each 4-character segment:

1. **Character Classification:**
   - **Type 1:** Lowercase (`a-z`)
   - **Type 2:** Uppercase (`A-Z`)
   - **Type 3:** Digit (`0-9`)
   - **Type 4:** Special Character (`[^a-zA-Z0-9]`)

2. **Scoring:**
   - **Base Score:**  
     `10 × (Number of Unique Character Types)`
   - **Additional Score:**  
     For each character type `t` present in the segment, add:  
     `(Number of characters of type t in the segment) × (10 / Overall count of type t in the full Base64 string)`

3. **Final Entropy Score:**  
   The sum of the base and additional scores, favoring segments with diverse and less-frequent character types.

---

## Truncation Selection Logic

Given a target output length `L` (where `L` is a multiple of 4):

- **Number of Segments Needed:**  
  The number of required segments is calculated by dividing L by 4 (i.e., Segments Required = L / 4).

- **Fixed Inclusions:**
  - The **first segment** is always included.
  - The **last segment** is always included.

- **Selection Process:**
  - Among the remaining segments, select those with the highest entropy scores until the total number of segments equals L / 4.
  - If multiple segments have identical entropy scores, ties are resolved by favoring the segment that appears earlier in the Base64 sequence, ensuring deterministic selection.

**Example:**  
For a target length of 24 characters, 6 segments are required:  
- 1st segment: Included by default  
- Last segment: Included by default  
- Select the top 4 scoring segments from the intermediate segments.

---

## Character Diversity Enforcement

After forming the truncated output:

1. **Validation:**  
   Check the presence of all four character categories:
   - Lowercase, Uppercase, Digit, and Special Character.

2. **Substitution Strategy:**  
   If one or more types are absent:
   - Identify the most frequent character type in the output.
   - Replace an occurrence of this overrepresented type with a predetermined character representing the missing type:
     - `'a'` for missing lowercase
     - `'A'` for missing uppercase
     - `'1'` for missing digit
     - `'/'` for missing special characters

This guarantees compliance with standard password complexity rules.

---

## Example Execution

**Inputs:**  
- Password Base: `user@example.com`  
- Secret Key: `hunter2`  
- Truncation Enabled: Yes  
- Desired Output Length: 24 characters

**Execution Steps:**
1. **HMAC-SHA512 Computation:**  
   Calculate the HMAC for `user@example.com` using `hunter2`.

2. **Base64 Encoding:**  
   Obtain an 88-character Base64 string from the HMAC.

3. **Segmentation and Scoring:**  
   Divide the string into 22 segments; compute entropy scores for each segment.

4. **Segment Selection:**  
   For a 24-character output, choose 6 segments: include the first and last segments plus the 4 with highest entropy among the remaining.

5. **Diversity Enforcement:**  
   Validate and, if necessary, adjust the output to ensure all four character types are present.

6. **Final Output:**  
   The deterministic password might be:  
   `Smvp/1dsWcC+qB/y90vPvw==`  
   *(This is an illustrative example.)*

---

## User Interface (UI) Design Notes

- **Input Validation:**  
  Inline error messages prompt the user if the Password Base or Secret Key is missing.
- **Modal Dialogs:**  
  A modal interface allows selection of the desired truncation length with visual feedback.
- **Copy Functionality:**  
  A copy-to-clipboard function is provided using the deprecated `document.execCommand` method to ensure compatibility with older systems, despite its deprecation in modern contexts.

---

## Legal and Defensive Publication Notes

This document is issued as a **defensive publication** to establish prior art for the following innovative elements:
- **Entropy-Scored Truncation:**  
  The method of dividing a Base64-encoded HMAC output into segments, evaluating their entropy, and selectively truncating the output.
- **Diversity Enforcement Mechanism:**  
  The controlled substitution ensuring that the final password contains at least one lowercase letter, one uppercase letter, one digit, and one special character.
- **Deterministic Password Generation:**  
  The overall approach that yields reproducible, high-entropy passwords from the same set of inputs, including deterministic tie resolution for entropy-scored segment selection.

The disclosed technique is released under the MIT License, making it freely available to the software community and precluding the issuance of any future patents on these methods.

---

## Conclusion

This disclosure documents a novel approach to deterministic password generation, integrating HMAC-SHA512 and Base64 encoding with a unique entropy-based truncation method and character diversity enforcement. By establishing this method as prior art, the publication safeguards the open use of these techniques within the software development community and deters future patent claims on similar methods.
