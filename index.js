// =======================
// DOM & STATE
// =======================

const display = document.getElementById("display");
let currentValue = "0";


// =======================
// INPUT HANDLERS
// =======================

// Append digits to display
function appendToDisplay(value) {
  if (currentValue === "0") {
    currentValue = value;
  } else {
    currentValue += value;
  }
  updateDisplay();
}

// Append operators (+ - * / %)
function appendOperator(op) {

  // Allow starting a negative number
  if (currentValue === "0" && op === "-") {
    currentValue = "-";
    display.value = "-";
    return;
  }

  if (currentValue === "0") return;

  // Replace last operator if already present
  if (/[+\-*/%]$/.test(currentValue)) {
    currentValue = currentValue.slice(0, -1) + op;
  } else {
    currentValue += op;
  }

  display.value = currentValue; // raw display
}

// Append decimal point to the current number only
function appendDecimal() {
  const parts = extractLastNumber(currentValue);
  if (!parts) return;

  let { before, number } = parts;

  // Prevent multiple decimals in one number
  if (number.includes(".")) return;

  currentValue = before + number + ".";
  updateDisplay();
}


// =======================
// EDITING CONTROLS
// =======================

// Clear everything
function clearDisplay() {
  currentValue = "0";
  updateDisplay();
}

// Remove last character
function backspace() {
  if (currentValue.length <= 1 || currentValue === "-") {
    currentValue = "0";
  } else {
    currentValue = currentValue.slice(0, -1);
  }
  updateDisplay();
}

// Toggle sign of the last number
function toggleSign() {
  const match = currentValue.match(
    /^(.*?)([+\-*/%])(\(?-?\d*\.?\d+\)?)$/
  );
  if (!match) return;

  let [, left, op, num] = match;

  const isWrapped = num.startsWith("(");
  const cleanNum = num.replace(/[()]/g, "").replace("-", "");

  // CASE 1: + and - operators (3-state iPhone logic)
  if (op === "+" || op === "-") {
    if (op === "-" && !isWrapped) {
      // 4/9-5 → 4/9+5
      currentValue = left + "+" + cleanNum;
    } else if (op === "+" && !isWrapped) {
      // 4/9+5 → 4/9+(-5)
      currentValue = left + "+(-" + cleanNum + ")";
    } else {
      // 4/9+(-5) → 4/9+5
      currentValue = left + "+" + cleanNum;
    }
  }

  // CASE 2: *, /, % (operand-only toggle)
  else {
    if (isWrapped) {
      // 4.5%(-3.5) → 4.5%3.5
      currentValue = left + op + cleanNum;
    } else {
      // 4.5%3.5 → 4.5%(-3.5)
      currentValue = left + op + "(-" + cleanNum + ")";
    }
  }

  updateDisplay();
}




// =======================
// CALCULATION
// =======================

function calculateResult() {
  try {
    const processed = resolvePercentages(currentValue);
    const result = eval(processed);

    if (!isFinite(result)) throw new Error();

    currentValue = result.toString();
    updateDisplay();
  } catch {
    display.value = "Error";
    currentValue = "0";
  }
}


// =======================
// DISPLAY & FORMATTING
// =======================

function updateDisplay() {

  // Split expression by last operator
  const parts = splitByLastOperator(currentValue);

  // Expression exists (e.g. 12+345)
  if (parts) {
    const { left, operator, right } = parts;

    // Format only the last number
    let formattedRight = right.includes(".")
      ? formatIndianNumberString(right.split(".")[0]) + "." + right.split(".")[1]
      : formatIndianNumberString(right);

    display.value = left + operator + formattedRight;
    display.scrollLeft = display.scrollWidth;
    return;
  }

  // Pure number formatting
  if (currentValue.includes(".")) {
    const [intPart, decPart] = currentValue.split(".");
    display.value = formatIndianNumberString(intPart) + "." + decPart;
  } else {
    display.value = formatIndianNumberString(currentValue);
  }

  display.scrollLeft = display.scrollWidth;
}

// Indian number system formatting (e.g. 12,34,567)
function formatIndianNumberString(numStr) {
  let sign = "";

  if (numStr.startsWith("-")) {
    sign = "-";
    numStr = numStr.slice(1);
  }

  if (numStr.length <= 3) return sign + numStr;

  const last3 = numStr.slice(-3);
  const rest = numStr.slice(0, -3);

  const formatted =
    rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;

  return sign + formatted;
}


// =======================
// HELPERS (REGEX PARSING)
// =======================

function resolvePercentages(expr) {
  // Only convert % when it is NOT followed by a number (unary %)
  return expr.replace(/(\d*\.?\d+)%(\D|$)/g, (_, n, tail) => {
    return String(Number(n) / 100) + tail;
  });
}


// Split expression into left, operator, right (last operator only)
function splitByLastOperator(expr) {
  const match = expr.match(/^(.*?)([+\-*/%])([^+\-*/%]*)$/);
  if (!match) return null;

  return {
    left: match[1],
    operator: match[2],
    right: match[3],
  };
}

// Extract last number from expression
function extractLastNumber(expr) {
  const match = expr.match(/^(.*?)(-?\d*\.?\d+)$/);
  if (!match) return null;

  return {
    before: match[1],
    number: match[2],
  };
}
