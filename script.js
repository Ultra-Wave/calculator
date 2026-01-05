// Responsive Calculator — script.js
(() => {
  const displayEl = document.getElementById('display');
  const buttons = Array.from(document.querySelectorAll('.btn'));
  let expression = ''; // expression string shown to user
  let resetNext = false; // if true, next number press starts new expression

  function updateDisplay(text){
    displayEl.textContent = text || '0';
  }

  function safeEval(expr) {
    // allow only digits, operators, parentheses, decimal, spaces
    const safe = /^[0-9+\-*/().\s]+$/;
    if (!safe.test(expr)) throw new Error('Invalid expression');
    // Basic safety: avoid leading operator problems
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + expr + ')')();
  }

  function handleInput(action){
    if (action === 'clear') {
      expression = '';
      resetNext = false;
      updateDisplay('0');
      return;
    }

    if (action === 'delete') {
      if (resetNext) { expression = ''; resetNext = false; updateDisplay('0'); return; }
      expression = expression.slice(0, -1);
      updateDisplay(expression || '0');
      return;
    }

    if (action === 'percent') {
      // make percent of the last number: convert last number to /100
      // find last number in expression
      const match = expression.match(/([0-9.]+)$/);
      if (match) {
        const num = parseFloat(match[1]);
        const replaced = (num / 100).toString();
        expression = expression.slice(0, -match[1].length) + replaced;
        updateDisplay(expression);
      }
      return;
    }

    if (action === '=') {
      if (!expression) return;
      try {
        const result = safeEval(expression);
        expression = String(result);
        updateDisplay(expression);
        resetNext = true;
      } catch (e) {
        updateDisplay('Error');
        expression = '';
        resetNext = true;
      }
      return;
    }

    // digits, decimal and operators
    if (resetNext && /[0-9.]/.test(action)) {
      expression = action;
      resetNext = false;
      updateDisplay(expression);
      return;
    }

    // Prevent multiple operators in a row (except minus for negative numbers)
    if (/[+\-*/]/.test(action)) {
      if (!expression && action !== '-') return; // don't start with operator except minus
      if (/[+\-*/]$/.test(expression)) {
        // replace last operator
        expression = expression.slice(0, -1) + action;
        updateDisplay(expression);
        return;
      }
    }

    // Prevent multiple decimals in the same number
    if (action === '.') {
      const parts = expression.split(/[+\-*/]/);
      const last = parts[parts.length - 1];
      if (last.includes('.')) return;
      if (!last) action = '0.';
    }

    expression += action;
    updateDisplay(expression);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.getAttribute('data-action');
      handleInput(action);
    });
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((/^[0-9]$/).test(key)) { handleInput(key); e.preventDefault(); return; }
    if (key === '.') { handleInput('.'); e.preventDefault(); return; }
    if (key === 'Enter' || key === '=') { handleInput('='); e.preventDefault(); return; }
    if (key === 'Backspace') { handleInput('delete'); e.preventDefault(); return; }
    if (key === 'Escape') { handleInput('clear'); e.preventDefault(); return; }
    if (key === '%') { handleInput('percent'); e.preventDefault(); return; }
    if (['+','-','*','/','(',')'].includes(key)) { handleInput(key); e.preventDefault(); return; }
  });

  // touch-friendly: add aria-pressed style briefly (optional)
  buttons.forEach(btn => {
    btn.addEventListener('pointerdown', () => btn.classList.add('active'));
    btn.addEventListener('pointerup', () => btn.classList.remove('active'));
    btn.addEventListener('pointerleave', () => btn.classList.remove('active'));
  });

  // init
  updateDisplay('0');
})();