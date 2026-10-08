/**
 * Advanced Multi-Mode Calculator Logic
 * Standard, Scientific, Unit Converter & Financial Tools
 */

// Application State
const state = {
  mode: 'standard', // 'standard', 'scientific', 'converter', 'financial'
  expression: '',
  result: '0',
  isEvaluated: false,
  angleUnit: 'DEG', // 'DEG' or 'RAD'
  memory: 0,
  hasMemory: false,
  history: JSON.parse(localStorage.getItem('calchub_history')) || [],
  soundEnabled: localStorage.getItem('calchub_sound') !== 'false',
  theme: localStorage.getItem('calchub_theme') || 'dark',
};

// Unit Conversion Table
const UNIT_DATA = {
  length: {
    units: {
      m: { name: 'Meters (m)', factor: 1 },
      km: { name: 'Kilometers (km)', factor: 1000 },
      cm: { name: 'Centimeters (cm)', factor: 0.01 },
      mm: { name: 'Millimeters (mm)', factor: 0.001 },
      mi: { name: 'Miles (mi)', factor: 1609.344 },
      yd: { name: 'Yards (yd)', factor: 0.9144 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      in: { name: 'Inches (in)', factor: 0.0254 }
    },
    defaultFrom: 'm',
    defaultTo: 'ft'
  },
  mass: {
    units: {
      kg: { name: 'Kilograms (kg)', factor: 1 },
      g: { name: 'Grams (g)', factor: 0.001 },
      mg: { name: 'Milligrams (mg)', factor: 0.000001 },
      lb: { name: 'Pounds (lb)', factor: 0.45359237 },
      oz: { name: 'Ounces (oz)', factor: 0.02834952 }
    },
    defaultFrom: 'kg',
    defaultTo: 'lb'
  },
  temperature: {
    units: {
      c: { name: 'Celsius (°C)' },
      f: { name: 'Fahrenheit (°F)' },
      k: { name: 'Kelvin (K)' }
    },
    defaultFrom: 'c',
    defaultTo: 'f'
  },
  storage: {
    units: {
      B: { name: 'Bytes (B)', factor: 1 },
      KB: { name: 'Kilobytes (KB)', factor: 1024 },
      MB: { name: 'Megabytes (MB)', factor: 1048576 },
      GB: { name: 'Gigabytes (GB)', factor: 1073741824 },
      TB: { name: 'Terabytes (TB)', factor: 1099511627776 }
    },
    defaultFrom: 'GB',
    defaultTo: 'MB'
  },
  speed: {
    units: {
      kmh: { name: 'km/h', factor: 0.277778 },
      mph: { name: 'Miles/h (mph)', factor: 0.44704 },
      ms: { name: 'm/s', factor: 1 },
      knot: { name: 'Knots (kn)', factor: 0.514444 }
    },
    defaultFrom: 'kmh',
    defaultTo: 'mph'
  },
  time: {
    units: {
      s: { name: 'Seconds (s)', factor: 1 },
      min: { name: 'Minutes (min)', factor: 60 },
      h: { name: 'Hours (h)', factor: 3600 },
      d: { name: 'Days (d)', factor: 86400 },
      wk: { name: 'Weeks (wk)', factor: 604800 }
    },
    defaultFrom: 'h',
    defaultTo: 'min'
  }
};

let currentConverterCategory = 'length';

// DOM Elements
const exprEl = document.getElementById('displayExpression');
const resEl = document.getElementById('displayResult');
const angleBadgeEl = document.getElementById('angleBadge');
const memIndicatorEl = document.getElementById('memoryIndicator');
const soundBtnEl = document.getElementById('soundToggleBtn');
const themeBtnEl = document.getElementById('themeToggleBtn');
const historyDrawerEl = document.getElementById('historyDrawer');
const historyListEl = document.getElementById('historyList');

// Web Audio API Synthesis for Click Feedback
let audioCtx = null;
function playClickSound() {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Audio unsupported or restricted
  }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  updateDisplay();
  renderHistory();
  initUnitConverter();
  calculateEMI();
  calculateGST();
  calculateDiscount();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  if (themeBtnEl) themeBtnEl.innerHTML = state.theme === 'light' ? '🌙' : '☀️';
  if (soundBtnEl) soundBtnEl.innerHTML = state.soundEnabled ? '🔊' : '🔇';
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('calchub_theme', state.theme);
  if (themeBtnEl) themeBtnEl.innerHTML = state.theme === 'light' ? '🌙' : '☀️';
  showToast(`Switched to ${state.theme} mode`);
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem('calchub_sound', state.soundEnabled);
  if (soundBtnEl) soundBtnEl.innerHTML = state.soundEnabled ? '🔊' : '🔇';
  showToast(state.soundEnabled ? 'Key sounds enabled' : 'Key sounds muted');
}

// Event Listeners
function setupEventListeners() {
  themeBtnEl?.addEventListener('click', toggleTheme);
  soundBtnEl?.addEventListener('click', toggleSound);

  // Angle toggle
  angleBadgeEl?.addEventListener('click', () => {
    state.angleUnit = state.angleUnit === 'DEG' ? 'RAD' : 'DEG';
    if (angleBadgeEl) angleBadgeEl.textContent = state.angleUnit;
    showToast(`Angle mode: ${state.angleUnit}`);
    playClickSound();
  });

  // History button
  document.getElementById('historyToggleBtn')?.addEventListener('click', toggleHistoryDrawer);
  document.getElementById('closeHistoryBtn')?.addEventListener('click', toggleHistoryDrawer);
  document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);

  // Copy result
  document.getElementById('copyResultBtn')?.addEventListener('click', copyResult);
  document.getElementById('backspaceBtn')?.addEventListener('click', handleBackspace);

  // Mode Switch Tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchMode(tab.dataset.mode);
      playClickSound();
    });
  });

  // Calculator Buttons
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const action = btn.dataset.action;
      const val = btn.dataset.val;

      if (action === 'num') inputDigit(val);
      else if (action === 'op') inputOperator(val);
      else if (action === 'fn') inputFunction(val);
      else if (action === 'clear') clearAll();
      else if (action === 'backspace') handleBackspace();
      else if (action === 'equals') evaluateExpression();
      else if (action === 'toggle-sign') toggleSign();
      else if (action === 'dot') inputDecimal();
      else if (action === 'paren') inputParen(val);
      else if (action === 'percent') inputPercent();
      else if (action === 'constant') inputConstant(val);
      else if (action === 'mem') handleMemory(val);
    });
  });

  // Keyboard Listeners
  window.addEventListener('keydown', handleKeyboard);
}

// Switch Application Modes
function switchMode(mode) {
  state.mode = mode;
  
  const standardKeypad = document.getElementById('standardKeypad');
  const scientificKeypad = document.getElementById('scientificKeypad');
  const converterView = document.getElementById('converterView');
  const financialView = document.getElementById('financialView');
  const displaySection = document.getElementById('displaySection');
  const memorySection = document.getElementById('memorySection');

  // Hide all
  [standardKeypad, scientificKeypad, converterView, financialView].forEach(el => {
    if (el) el.style.display = 'none';
  });

  const appContainer = document.getElementById('appContainer');
  if (appContainer) {
    appContainer.classList.toggle('wide', mode === 'scientific');
  }

  if (mode === 'standard') {
    if (displaySection) displaySection.style.display = 'flex';
    if (memorySection) memorySection.style.display = 'grid';
    if (standardKeypad) standardKeypad.style.display = 'grid';
  } else if (mode === 'scientific') {
    if (displaySection) displaySection.style.display = 'flex';
    if (memorySection) memorySection.style.display = 'grid';
    if (scientificKeypad) scientificKeypad.style.display = 'grid';
  } else if (mode === 'converter') {
    if (displaySection) displaySection.style.display = 'none';
    if (memorySection) memorySection.style.display = 'none';
    if (converterView) converterView.style.display = 'flex';
  }
}

// Keyboard Input Handler
function handleKeyboard(e) {
  // If typing in converter or financial input, do not capture
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  const key = e.key;

  if (/[0-9]/.test(key)) {
    inputDigit(key);
    playClickSound();
  } else if (key === '.') {
    inputDecimal();
    playClickSound();
  } else if (['+', '-', '*', '/'].includes(key)) {
    const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    inputOperator(opMap[key]);
    playClickSound();
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluateExpression();
    playClickSound();
  } else if (key === 'Backspace') {
    handleBackspace();
    playClickSound();
  } else if (key === 'Escape') {
    clearAll();
    playClickSound();
  } else if (key === '(' || key === ')') {
    inputParen(key);
    playClickSound();
  } else if (key === '%') {
    inputPercent();
    playClickSound();
  }
}

// Display Updates
function updateDisplay() {
  if (exprEl) exprEl.textContent = state.expression;
  if (resEl) {
    resEl.textContent = state.result;
    // Auto-scale font size for large outputs
    if (state.result.length > 12) {
      resEl.style.fontSize = '1.8rem';
    } else if (state.result.length > 8) {
      resEl.style.fontSize = '2.3rem';
    } else {
      resEl.style.fontSize = 'clamp(2rem, 6vw, 3rem)';
    }
  }
  if (memIndicatorEl) {
    memIndicatorEl.classList.toggle('active', state.hasMemory);
  }
}

// Input Handlers
function inputDigit(digit) {
  if (state.isEvaluated) {
    state.expression = '';
    state.result = '0';
    state.isEvaluated = false;
  }

  if (state.result === '0' && digit !== '.') {
    state.result = digit;
  } else {
    state.result += digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (state.isEvaluated) {
    state.expression = '';
    state.result = '0';
    state.isEvaluated = false;
  }
  if (!state.result.includes('.')) {
    state.result += '.';
    updateDisplay();
  }
}

function inputOperator(op) {
  if (state.isEvaluated) {
    state.expression = state.result + ' ' + op + ' ';
    state.result = '0';
    state.isEvaluated = false;
  } else {
    state.expression += state.result + ' ' + op + ' ';
    state.result = '0';
  }
  updateDisplay();
}

function inputParen(p) {
  if (state.isEvaluated) {
    state.expression = '';
    state.isEvaluated = false;
  }
  state.expression += p;
  updateDisplay();
}

function inputPercent() {
  const num = parseFloat(state.result);
  if (!isNaN(num)) {
    state.result = String(num / 100);
    updateDisplay();
  }
}

function toggleSign() {
  const num = parseFloat(state.result);
  if (!isNaN(num) && num !== 0) {
    state.result = String(-num);
    updateDisplay();
  }
}

function inputConstant(c) {
  if (c === 'pi') state.result = String(Math.PI);
  else if (c === 'e') state.result = String(Math.E);
  else if (c === 'rand') state.result = String(Math.random().toFixed(6));
  state.isEvaluated = false;
  updateDisplay();
}

function handleBackspace() {
  if (state.isEvaluated) {
    clearAll();
    return;
  }
  if (state.result.length > 1 && state.result !== '0') {
    state.result = state.result.slice(0, -1);
  } else {
    state.result = '0';
  }
  updateDisplay();
}

function clearAll() {
  state.expression = '';
  state.result = '0';
  state.isEvaluated = false;
  updateDisplay();
}

// Function Evaluations (Scientific)
function inputFunction(fn) {
  const num = parseFloat(state.result);
  if (isNaN(num)) return;

  const toRad = deg => deg * (Math.PI / 180);
  const toDeg = rad => rad * (180 / Math.PI);

  let evaluated = null;

  switch (fn) {
    case 'sin':
      evaluated = Math.sin(state.angleUnit === 'DEG' ? toRad(num) : num);
      break;
    case 'cos':
      evaluated = Math.cos(state.angleUnit === 'DEG' ? toRad(num) : num);
      break;
    case 'tan':
      evaluated = Math.tan(state.angleUnit === 'DEG' ? toRad(num) : num);
      break;
    case 'asin':
      evaluated = state.angleUnit === 'DEG' ? toDeg(Math.asin(num)) : Math.asin(num);
      break;
    case 'acos':
      evaluated = state.angleUnit === 'DEG' ? toDeg(Math.acos(num)) : Math.acos(num);
      break;
    case 'atan':
      evaluated = state.angleUnit === 'DEG' ? toDeg(Math.atan(num)) : Math.atan(num);
      break;
    case 'sinh':
      evaluated = Math.sinh(num);
      break;
    case 'cosh':
      evaluated = Math.cosh(num);
      break;
    case 'tanh':
      evaluated = Math.tanh(num);
      break;
    case 'sqrt':
      evaluated = Math.sqrt(num);
      break;
    case 'cbrt':
      evaluated = Math.cbrt(num);
      break;
    case 'sq':
      evaluated = Math.pow(num, 2);
      break;
    case 'cube':
      evaluated = Math.pow(num, 3);
      break;
    case 'inv':
      evaluated = 1 / num;
      break;
    case 'log':
      evaluated = Math.log10(num);
      break;
    case 'ln':
      evaluated = Math.log(num);
      break;
    case 'exp':
      evaluated = Math.exp(num);
      break;
    case '10pow':
      evaluated = Math.pow(10, num);
      break;
    case 'fact':
      evaluated = factorial(num);
      break;
    case 'abs':
      evaluated = Math.abs(num);
      break;
    case 'pow':
      state.expression += `${num} ^ `;
      state.result = '0';
      updateDisplay();
      return;
  }

  if (evaluated !== null) {
    if (isNaN(evaluated) || !isFinite(evaluated)) {
      state.result = 'Error';
    } else {
      state.expression = `${fn}(${num})`;
      state.result = cleanNumber(evaluated);
      addHistory(state.expression, state.result);
      state.isEvaluated = true;
    }
    updateDisplay();
  }
}

function factorial(n) {
  if (n < 0 || n > 170) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.floor(n); i++) res *= i;
  return res;
}

// Math Expression Evaluator
function evaluateExpression() {
  let fullExpr = state.expression;
  if (!state.isEvaluated) {
    fullExpr += state.result;
  }

  if (!fullExpr.trim()) return;

  try {
    // Sanitize and replace math operator symbols
    let sanitized = fullExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\^/g, '**');

    // Auto-close missing parentheses
    const openParen = (sanitized.match(/\(/g) || []).length;
    const closeParen = (sanitized.match(/\)/g) || []).length;
    if (openParen > closeParen) {
      sanitized += ')'.repeat(openParen - closeParen);
    }

    // Safe mathematical evaluation
    // Function constructor prevents access to global variables
    const evalResult = Function(`'use strict'; return (${sanitized})`)();

    if (isNaN(evalResult) || !isFinite(evalResult)) {
      state.result = 'Error';
    } else {
      const formatted = cleanNumber(evalResult);
      addHistory(fullExpr, formatted);
      state.expression = fullExpr + ' =';
      state.result = formatted;
      state.isEvaluated = true;
    }
  } catch (err) {
    state.result = 'Error';
  }

  updateDisplay();
}

function cleanNumber(num) {
  // Fix precision artifacts like 0.1 + 0.2 = 0.30000000000000004
  const rounded = parseFloat(num.toFixed(10));
  return String(rounded);
}

// Memory Operations
function handleMemory(action) {
  const currentVal = parseFloat(state.result) || 0;
  if (action === 'MC') {
    state.memory = 0;
    state.hasMemory = false;
    showToast('Memory Cleared (MC)');
  } else if (action === 'MR') {
    state.result = String(state.memory);
    state.isEvaluated = false;
    showToast(`Memory Recalled: ${state.memory}`);
  } else if (action === 'M+') {
    state.memory += currentVal;
    state.hasMemory = true;
    showToast(`Added to Memory (M+)`);
  } else if (action === 'M-') {
    state.memory -= currentVal;
    state.hasMemory = true;
    showToast(`Subtracted from Memory (M-)`);
  } else if (action === 'MS') {
    state.memory = currentVal;
    state.hasMemory = true;
    showToast(`Stored in Memory: ${currentVal}`);
  }
  updateDisplay();
}

// History System
function addHistory(expr, res) {
  state.history.unshift({
    expression: expr,
    result: res,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  if (state.history.length > 30) state.history.pop();
  localStorage.setItem('calchub_history', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (!historyListEl) return;
  if (state.history.length === 0) {
    historyListEl.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem; font-size: 0.9rem;">
        No calculations yet.<br/>Your calculations will appear here.
      </div>
    `;
    return;
  }

  historyListEl.innerHTML = state.history.map((h, i) => `
    <div class="history-item" onclick="loadHistoryItem(${i})">
      <div class="hist-expr">${h.expression}</div>
      <div class="hist-res">${h.result}</div>
      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${h.time}</div>
    </div>
  `).join('');
}

function loadHistoryItem(index) {
  const item = state.history[index];
  if (item) {
    state.expression = item.expression;
    state.result = item.result;
    state.isEvaluated = true;
    updateDisplay();
    toggleHistoryDrawer();
    showToast('Recalled from history');
  }
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem('calchub_history');
  renderHistory();
  showToast('History cleared');
}

function toggleHistoryDrawer() {
  historyDrawerEl?.classList.toggle('active');
}

// Copy Result
function copyResult() {
  navigator.clipboard.writeText(state.result).then(() => {
    showToast(`Copied ${state.result} to clipboard!`);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// ==========================================================================
// Unit Converter Logic
// ==========================================================================
function initUnitConverter() {
  const pills = document.querySelectorAll('.conv-type-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentConverterCategory = pill.dataset.type;
      populateConverterUnits();
      performConversion(1);
    });
  });

  populateConverterUnits();

  const val1 = document.getElementById('convVal1');
  const val2 = document.getElementById('convVal2');
  const u1 = document.getElementById('convUnit1');
  const u2 = document.getElementById('convUnit2');

  val1?.addEventListener('input', () => performConversion(1));
  val2?.addEventListener('input', () => performConversion(2));
  u1?.addEventListener('change', () => performConversion(1));
  u2?.addEventListener('change', () => performConversion(1));

  document.getElementById('convSwapBtn')?.addEventListener('click', swapConverterUnits);
}

function populateConverterUnits() {
  const cat = UNIT_DATA[currentConverterCategory];
  const u1 = document.getElementById('convUnit1');
  const u2 = document.getElementById('convUnit2');
  if (!cat || !u1 || !u2) return;

  const options = Object.keys(cat.units).map(key => `
    <option value="${key}">${cat.units[key].name}</option>
  `).join('');

  u1.innerHTML = options;
  u2.innerHTML = options;

  u1.value = cat.defaultFrom;
  u2.value = cat.defaultTo;
}

function performConversion(sourceIndex = 1) {
  const val1El = document.getElementById('convVal1');
  const val2El = document.getElementById('convVal2');
  const u1 = document.getElementById('convUnit1')?.value;
  const u2 = document.getElementById('convUnit2')?.value;
  const cat = UNIT_DATA[currentConverterCategory];
  if (!cat || !u1 || !u2) return;

  if (sourceIndex === 1) {
    const val = parseFloat(val1El.value);
    if (isNaN(val)) { val2El.value = ''; return; }

    let converted = 0;
    if (currentConverterCategory === 'temperature') {
      converted = convertTemp(val, u1, u2);
    } else {
      const base = val * cat.units[u1].factor;
      converted = base / cat.units[u2].factor;
    }
    val2El.value = parseFloat(converted.toFixed(6));
  } else {
    const val = parseFloat(val2El.value);
    if (isNaN(val)) { val1El.value = ''; return; }

    let converted = 0;
    if (currentConverterCategory === 'temperature') {
      converted = convertTemp(val, u2, u1);
    } else {
      const base = val * cat.units[u2].factor;
      converted = base / cat.units[u1].factor;
    }
    val1El.value = parseFloat(converted.toFixed(6));
  }
}

function convertTemp(val, from, to) {
  if (from === to) return val;
  // Convert from origin to Celsius
  let celsius = val;
  if (from === 'f') celsius = (val - 32) * (5 / 9);
  else if (from === 'k') celsius = val - 273.15;

  // Convert Celsius to destination
  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * (9 / 5)) + 32;
  if (to === 'k') return celsius + 273.15;
  return celsius;
}

function swapConverterUnits() {
  const u1 = document.getElementById('convUnit1');
  const u2 = document.getElementById('convUnit2');
  if (u1 && u2) {
    const temp = u1.value;
    u1.value = u2.value;
    u2.value = temp;
    performConversion(1);
  }
}

// ==========================================================================
// Financial Tools Logic (EMI, GST, Discount)
// ==========================================================================
function switchTool(toolId) {
  document.querySelectorAll('.tool-pill').forEach(p => p.classList.remove('active'));
  document.getElementById(`tool-tab-${toolId}`)?.classList.add('active');

  ['emiBox', 'gstBox', 'discountBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id.startsWith(toolId) ? 'flex' : 'none';
  });
}

// EMI Calculation
function calculateEMI() {
  const p = parseFloat(document.getElementById('emiPrincipal')?.value) || 0;
  const annualRate = parseFloat(document.getElementById('emiRate')?.value) || 0;
  const tenureMonths = parseFloat(document.getElementById('emiTenure')?.value) || 0;

  if (p <= 0 || annualRate <= 0 || tenureMonths <= 0) {
    document.getElementById('emiMonthly').textContent = '$0.00';
    document.getElementById('emiTotalInterest').textContent = '$0.00';
    document.getElementById('emiTotalPayment').textContent = '$0.00';
    return;
  }

  const monthlyRate = (annualRate / 12) / 100;
  const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - p;

  document.getElementById('emiMonthly').textContent = `$${emi.toFixed(2)}`;
  document.getElementById('emiTotalInterest').textContent = `$${totalInterest.toFixed(2)}`;
  document.getElementById('emiTotalPayment').textContent = `$${totalPayment.toFixed(2)}`;
}

// GST Calculation
function calculateGST() {
  const amount = parseFloat(document.getElementById('gstAmount')?.value) || 0;
  const rate = parseFloat(document.getElementById('gstRate')?.value) || 0;

  const gstValue = amount * (rate / 100);
  const totalAmount = amount + gstValue;

  document.getElementById('gstTaxAmount').textContent = `$${gstValue.toFixed(2)}`;
  document.getElementById('gstTotalAmount').textContent = `$${totalAmount.toFixed(2)}`;
}

// Discount Calculation
function calculateDiscount() {
  const original = parseFloat(document.getElementById('discOriginal')?.value) || 0;
  const percent = parseFloat(document.getElementById('discPercent')?.value) || 0;

  const savings = original * (percent / 100);
  const finalPrice = Math.max(0, original - savings);

  document.getElementById('discSavings').textContent = `$${savings.toFixed(2)}`;
  document.getElementById('discFinal').textContent = `$${finalPrice.toFixed(2)}`;
}

// Toast System
function showToast(message) {
  const toast = document.getElementById('toastBox');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}
