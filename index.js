const display = document.getElementById("display");

let currentValue = "0";

function appendToDisplay(value) {
    if (currentValue === "0") {
        currentValue = value;
    } else {
        currentValue += value;
    }
    updateDisplay();
}


function appendOperator(op) {
    if (currentValue === "0") return;

    if (/[+\-*/]$/.test(currentValue)) {
        currentValue = currentValue.slice(0, -1) + op;
    } else {
        currentValue += op;
    }

    display.value = currentValue; // raw
}


function clearDisplay(){
    currentValue = "0";
    updateDisplay();
}

function backspace(){
    if (currentValue.length <= 1 || currentValue === "-") {
        currentValue = "0";
    } else {
        currentValue = currentValue.slice(0, -1);
    }
    updateDisplay();
}


function toggleSign() {
    // Do nothing for 0 or empty
    if (currentValue === "0") return;

    if (/[+\-*/]/.test(currentValue)) return; // block for now

    if (currentValue.startsWith("-")) {
        currentValue = currentValue.slice(1);
    } else {
        currentValue = "-" + currentValue;
    }
    updateDisplay();
}

function calculateResult() {
    try {
        currentValue = eval(currentValue).toString();
        updateDisplay();
    } catch {
        display.value = "Error";
        currentValue = "0";
    }
}


function appendDecimal() {
    if (!currentValue.includes(".")) {
        currentValue += ".";
        display.value = currentValue;
    }
}

function updateDisplay() {

    // If expression or operator, show raw
    if (/[+\-*/]/.test(currentValue.slice(1))) {
        display.value = currentValue;
        display.scrollLeft = display.scrollWidth;
        return;
    }

    if (currentValue.includes(".")) {
        const [intPart, decPart] = currentValue.split(".");
        display.value =
            formatIndianNumberString(intPart) + "." + decPart;
    } else {
        display.value =
            formatIndianNumberString(currentValue);
    }

    display.scrollLeft = display.scrollWidth;
}


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


