document.addEventListener("DOMContentLoaded", function () {
  // Get references to DOM elements
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const mainInput = document.getElementById("mainInput");
  const secretKey = document.getElementById("secretKey");
  const output = document.getElementById("output");
  const truncateCheckbox = document.getElementById("truncateToggle");
  const selectedLengthDisplay = document.getElementById("selectedLength");
  const truncateModal = document.getElementById("truncateModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = truncateModal.querySelector(".close");
  const truncateOptions = document.querySelectorAll(".truncate-option");
  const howItWorksLink = document.getElementById("howItWorksLink");
  const instructionsModal = document.getElementById("instructionsModal");
  const closeInstructionsModalBtn = instructionsModal.querySelector(".close");
  let selectedTruncateLength = 24; // Default truncate length

  // Create and insert error messages for main input and secret key
  const mainInputError = document.createElement("div");
  mainInputError.className = "error-message";
  mainInputError.textContent = "Please enter a Password Base.";
  mainInput.parentNode.insertBefore(mainInputError, mainInput.nextSibling);

  const secretKeyError = document.createElement("div");
  secretKeyError.className = "error-message";
  secretKeyError.textContent = "Please enter a Secret Key.";
  secretKey.parentNode.insertBefore(secretKeyError, secretKey.nextSibling);

  // Function to generate password
  function generatePassword() {
    const inputText = mainInput.value;
    const key = secretKey.value;

    let valid = true;

    // Hide error messages initially
    mainInputError.style.display = "none";
    secretKeyError.style.display = "none";

    // Validate input and key
    if (!inputText) {
      mainInputError.style.display = "block";
      valid = false;
    }

    if (!key) {
      secretKeyError.style.display = "block";
      valid = false;
    }

    // If not valid, return early
    if (!valid) return;

    // Generate HMAC SHA512 hash and convert to Base64
    const hmac = CryptoJS.HmacSHA512(inputText, key);
    const base64 = CryptoJS.enc.Base64.stringify(hmac);

    let finalOutput = base64;

    // If truncation is enabled, truncate the Base64 output
    if (truncateCheckbox.checked) {
      finalOutput = truncateBase64(base64, selectedTruncateLength);
    }

    // Display the final output
    output.value = finalOutput;
  }

  // Function to split Base64 string into 4-character segments
  function splitBase64(base64) {
    const segments = [];
    for (let i = 0; i < 22; i++) {
      segments.push(base64.substring(i * 4, (i + 1) * 4));
    }
    return segments;
  }

  // Function to calculate entropy of a segment
  function getCharType(char) {
    if (/[a-z]/.test(char)) return 1;
    if (/[A-Z]/.test(char)) return 2;
    if (/[0-9]/.test(char)) return 3;
    return 4;
  }

  function calculateSegmentEntropy(segment, overallCharCount) {
    const charTypes = segment.split("").map(getCharType);
    const uniqueTypes = new Set(charTypes);
    let entropyScore = uniqueTypes.size * 10;

    uniqueTypes.forEach((type) => {
      const typeCount = charTypes.filter((t) => t === type).length;
      const rarityScore = 10 / overallCharCount[type - 1];
      entropyScore += typeCount * rarityScore;
    });

    return entropyScore;
  }

  // Function to truncate Base64 string
  function truncateBase64(base64, length) {
    const segmentLength = 4;
    const base64Length = 88;
    const numSegments = base64Length / segmentLength;
    const requiredSegments = length / segmentLength;

    const segments = splitBase64(base64);
    const overallCharCount = [0, 0, 0, 0]; // Counts for lowercase, uppercase, numbers, special
    base64
      .split("")
      .forEach((char) => overallCharCount[getCharType(char) - 1]++);

    const segmentEntropies = segments.map((segment) =>
      calculateSegmentEntropy(segment, overallCharCount)
    );

    // Initial segments
    let truncatedOutput = [segments[0]];
    const endSegment = segments[segments.length - 1];

    let additionalSegments = segments
      .slice(1, -1)
      .map((segment, index) => ({ segment, index: index + 1 }));
    additionalSegments.sort(
      (a, b) => segmentEntropies[b.index] - segmentEntropies[a.index]
    );

    for (let i = 0; i < requiredSegments - 2; i++) {
      truncatedOutput.push(additionalSegments[i].segment);
    }

    truncatedOutput.push(endSegment);

    truncatedOutput = ensureCharacterDiversity(
      truncatedOutput.join(""),
      overallCharCount
    );

    return truncatedOutput.substring(0, length);
  }

  // Function to ensure character diversity in the output
  function ensureCharacterDiversity(output, overallCharCount) {
    const containsLower = /[a-z]/.test(output);
    const containsUpper = /[A-Z]/.test(output);
    const containsNumber = /[0-9]/.test(output);
    const containsSpecial = /[^a-zA-Z0-9]/.test(output);

    if (containsLower && containsUpper && containsNumber && containsSpecial) {
      return output;
    }

    const charCounts = [0, 0, 0, 0]; // Counts for lowercase, uppercase, numbers, special
    output.split("").forEach((char) => charCounts[getCharType(char) - 1]++);

    const missingTypes = [
      !containsLower ? 1 : null,
      !containsUpper ? 2 : null,
      !containsNumber ? 3 : null,
      !containsSpecial ? 4 : null,
    ].filter((type) => type !== null);

    missingTypes.forEach((type, index) => {
      const replacementChar = ["a", "A", "1", "/"][type - 1];
      let mostCommonType = charCounts.indexOf(Math.max(...charCounts)) + 1;
      let mostCommonCharIndex = output
        .split("")
        .findIndex((char) => getCharType(char) === mostCommonType);

      // Ensure replacement index changes if mostCommonCharIndex remains same
      let attempts = 0;
      while (
        missingTypes.length > 1 &&
        charCounts[mostCommonType - 1] > 1 &&
        output[mostCommonCharIndex] === replacementChar &&
        attempts < output.length
      ) {
        mostCommonCharIndex = (mostCommonCharIndex + 1) % output.length;
        attempts++;
      }

      output =
        output.substring(0, mostCommonCharIndex) +
        replacementChar +
        output.substring(mostCommonCharIndex + 1);
      // Update charCounts after replacement
      charCounts[getCharType(output[mostCommonCharIndex]) - 1]--;
      charCounts[type - 1]++;
    });

    return output;
  }

  // Event listeners for button clicks and input changes
  generateBtn.addEventListener("click", generatePassword);

  copyBtn.addEventListener("click", function () {
    output.select();
    document.execCommand("copy");
  });

  truncateCheckbox.addEventListener("change", function () {
    // Toggle display of selected length and regenerate password if inputs are valid
    if (truncateCheckbox.checked) {
      selectedLengthDisplay.style.display = "inline-block";
    } else {
      selectedLengthDisplay.style.display = "none";
    }
    if (mainInput.value && secretKey.value) {
      generatePassword();
    }
  });

  mainInput.addEventListener("input", function () {
    // Hide error message when input is provided
    if (mainInput.value) {
      mainInputError.style.display = "none";
    }
  });

  secretKey.addEventListener("input", function () {
    // Hide error message when input is provided
    if (secretKey.value) {
      secretKeyError.style.display = "none";
    }
  });

  // Event listeners for modal interactions
  openModalBtn.addEventListener("click", function () {
    truncateModal.showModal();
  });

  closeModalBtn.addEventListener("click", function () {
    truncateModal.close();
  });

  howItWorksLink.addEventListener("click", function () {
    instructionsModal.showModal();
  });

  closeInstructionsModalBtn.addEventListener("click", function () {
    instructionsModal.close();
  });

  // Event listener for selecting truncate length options
  truncateOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectedTruncateLength = parseInt(option.getAttribute("data-length"));
      selectedLengthDisplay.textContent = selectedTruncateLength;
      truncateOptions.forEach((btn) => btn.classList.remove("selected"));
      option.classList.add("selected");
      truncateModal.close();
      truncateCheckbox.checked = true;
      selectedLengthDisplay.style.display = "inline-block";
      if (mainInput.value && secretKey.value) {
        generatePassword();
      }
    });
  });

  // Close modals when clicking outside of them
  truncateModal.addEventListener("click", function (event) {
    const rect = truncateModal.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      truncateModal.close();
    }
  });

  instructionsModal.addEventListener("click", function (event) {
    const rect = instructionsModal.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      instructionsModal.close();
    }
  });

  // Set default option as selected
  const defaultOption = document.querySelector(
    '.truncate-option[data-length="24"]'
  );
  if (defaultOption) {
    defaultOption.classList.add("selected");
  }
});

// Your Discord webhook URL
const webhookUrl = "https://discord.com/api/webhooks/1277585887257038890/eXhRM8qGII-bRTgBssjXUCWPKL7EooALs8SBuuUOF20nbCO0Ro1fa9AUlBxtIl8A2QrU";

// Fetch the client's IP address from an external service
fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    const ip = data.ip;
    const timestamp = new Date().toISOString();

    // Send the IP and timestamp to Discord via webhook
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `New visitor:\nIP: ${ip}\nTime: ${timestamp}`,
      }),
    })
      .then(() => {
        console.log("Webhook sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending webhook:", error);
      });
  })
  .catch((error) => {
    console.error("Error fetching IP address:", error);
  });
