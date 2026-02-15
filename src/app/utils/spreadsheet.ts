// Spreadsheet formula parser and evaluator

export interface Cell {
  value: string;
  displayValue?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
  bgColor?: string;
  error?: string;
}

// Convert column letter to number (A=0, B=1, etc.)
export function columnLetterToNumber(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}

// Convert number to column letter (0=A, 1=B, etc.)
export function numberToColumnLetter(num: number): string {
  let result = "";
  let n = num;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

// Parse cell reference like "A1" to {row: 0, col: 0}
export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  
  const col = columnLetterToNumber(match[1]);
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
}

// Parse range like "A1:B5" to array of cell references
export function parseRange(range: string): { row: number; col: number }[] | null {
  const parts = range.split(":");
  if (parts.length !== 2) return null;
  
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  
  if (!start || !end) return null;
  
  const cells: { row: number; col: number }[] = [];
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
    for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
      cells.push({ row, col });
    }
  }
  
  return cells;
}

// Get numeric value from cell
export function getCellNumericValue(cell: Cell): number {
  if (!cell || !cell.value) return 0;
  
  // If it's a formula, use display value
  const val = cell.displayValue || cell.value;
  
  // Remove currency symbols, spaces, etc.
  const cleaned = val.replace(/[€$,\s]/g, "");
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

// Evaluate a formula
export function evaluateFormula(
  formula: string,
  rows: Cell[][],
  currentRow: number,
  currentCol: number,
  visited = new Set<string>()
): { value: string; error?: string } {
  // Remove leading =
  formula = formula.substring(1).trim().toUpperCase();
  
  // Detect circular reference
  const cellId = `${currentRow},${currentCol}`;
  if (visited.has(cellId)) {
    return { value: "", error: "#REF!" };
  }
  visited.add(cellId);
  
  try {
    // Handle functions
    const result = evaluateExpression(formula, rows, visited);
    return { value: result.toString() };
  } catch (error) {
    return { value: "", error: "#ERROR!" };
  }
}

// Evaluate expression with functions
function evaluateExpression(expr: string, rows: Cell[][], visited: Set<string>): number | string {
  expr = expr.trim();
  
  // Handle SUM function
  if (expr.startsWith("SUM(") && expr.endsWith(")")) {
    const args = expr.substring(4, expr.length - 1);
    return evaluateSum(args, rows, visited);
  }
  
  // Handle AVERAGE function
  if (expr.startsWith("AVERAGE(") && expr.endsWith(")")) {
    const args = expr.substring(8, expr.length - 1);
    return evaluateAverage(args, rows, visited);
  }
  
  // Handle MIN function
  if (expr.startsWith("MIN(") && expr.endsWith(")")) {
    const args = expr.substring(4, expr.length - 1);
    return evaluateMin(args, rows, visited);
  }
  
  // Handle MAX function
  if (expr.startsWith("MAX(") && expr.endsWith(")")) {
    const args = expr.substring(4, expr.length - 1);
    return evaluateMax(args, rows, visited);
  }
  
  // Handle COUNT function
  if (expr.startsWith("COUNT(") && expr.endsWith(")")) {
    const args = expr.substring(6, expr.length - 1);
    return evaluateCount(args, rows, visited);
  }
  
  // Handle IF function
  if (expr.startsWith("IF(") && expr.endsWith(")")) {
    const args = expr.substring(3, expr.length - 1);
    return evaluateIf(args, rows, visited);
  }
  
  // Handle simple arithmetic
  return evaluateArithmetic(expr, rows, visited);
}

// Evaluate SUM function
function evaluateSum(args: string, rows: Cell[][], visited: Set<string>): number {
  const values = getValuesFromArgs(args, rows, visited);
  return values.reduce((sum, val) => sum + val, 0);
}

// Evaluate AVERAGE function
function evaluateAverage(args: string, rows: Cell[][], visited: Set<string>): number {
  const values = getValuesFromArgs(args, rows, visited);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Evaluate MIN function
function evaluateMin(args: string, rows: Cell[][], visited: Set<string>): number {
  const values = getValuesFromArgs(args, rows, visited);
  if (values.length === 0) return 0;
  return Math.min(...values);
}

// Evaluate MAX function
function evaluateMax(args: string, rows: Cell[][], visited: Set<string>): number {
  const values = getValuesFromArgs(args, rows, visited);
  if (values.length === 0) return 0;
  return Math.max(...values);
}

// Evaluate COUNT function
function evaluateCount(args: string, rows: Cell[][], visited: Set<string>): number {
  const values = getValuesFromArgs(args, rows, visited);
  return values.length;
}

// Evaluate IF function: IF(condition, value_if_true, value_if_false)
function evaluateIf(args: string, rows: Cell[][], visited: Set<string>): number | string {
  const parts = splitFunctionArgs(args);
  if (parts.length !== 3) throw new Error("IF requires 3 arguments");
  
  const condition = evaluateCondition(parts[0], rows, visited);
  const trueValue = parts[1].trim();
  const falseValue = parts[2].trim();
  
  if (condition) {
    // Return true value
    if (trueValue.startsWith('"') && trueValue.endsWith('"')) {
      return trueValue.substring(1, trueValue.length - 1);
    }
    return evaluateExpression(trueValue, rows, visited);
  } else {
    // Return false value
    if (falseValue.startsWith('"') && falseValue.endsWith('"')) {
      return falseValue.substring(1, falseValue.length - 1);
    }
    return evaluateExpression(falseValue, rows, visited);
  }
}

// Evaluate condition for IF
function evaluateCondition(condition: string, rows: Cell[][], visited: Set<string>): boolean {
  // Handle comparison operators
  const operators = [">=", "<=", "<>", "=", ">", "<"];
  
  for (const op of operators) {
    if (condition.includes(op)) {
      const parts = condition.split(op).map(p => p.trim());
      if (parts.length === 2) {
        const left = evaluateSimpleValue(parts[0], rows, visited);
        const right = evaluateSimpleValue(parts[1], rows, visited);
        
        switch (op) {
          case "=": return left === right;
          case "<>": return left !== right;
          case ">": return left > right;
          case "<": return left < right;
          case ">=": return left >= right;
          case "<=": return left <= right;
        }
      }
    }
  }
  
  return false;
}

// Evaluate simple value (number or cell reference)
function evaluateSimpleValue(expr: string, rows: Cell[][], visited: Set<string>): number {
  expr = expr.trim();
  
  // Check if it's a cell reference
  const cellRef = parseCellRef(expr);
  if (cellRef && rows[cellRef.row] && rows[cellRef.row][cellRef.col]) {
    return getCellNumericValue(rows[cellRef.row][cellRef.col]);
  }
  
  // Otherwise parse as number
  return parseFloat(expr) || 0;
}

// Split function arguments by comma (respecting nested functions)
function splitFunctionArgs(args: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  
  for (let i = 0; i < args.length; i++) {
    const char = args[i];
    
    if (char === '"') {
      inString = !inString;
      current += char;
    } else if (inString) {
      current += char;
    } else if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    result.push(current.trim());
  }
  
  return result;
}

// Get numeric values from function arguments
function getValuesFromArgs(args: string, rows: Cell[][], visited: Set<string>): number[] {
  const values: number[] = [];
  
  // Split arguments by comma
  const parts = splitFunctionArgs(args);
  
  for (const part of parts) {
    const trimmed = part.trim();
    
    // Check if it's a range
    if (trimmed.includes(":")) {
      const cells = parseRange(trimmed);
      if (cells) {
        for (const cell of cells) {
          if (rows[cell.row] && rows[cell.row][cell.col]) {
            const val = getCellNumericValue(rows[cell.row][cell.col]);
            if (val !== 0 || rows[cell.row][cell.col].value !== "") {
              values.push(val);
            }
          }
        }
      }
    }
    // Check if it's a cell reference
    else {
      const cellRef = parseCellRef(trimmed);
      if (cellRef && rows[cellRef.row] && rows[cellRef.row][cellRef.col]) {
        const val = getCellNumericValue(rows[cellRef.row][cellRef.col]);
        if (val !== 0 || rows[cellRef.row][cellRef.col].value !== "") {
          values.push(val);
        }
      } else {
        // Try to parse as number
        const num = parseFloat(trimmed);
        if (!isNaN(num)) {
          values.push(num);
        }
      }
    }
  }
  
  return values;
}

// Evaluate arithmetic expression
function evaluateArithmetic(expr: string, rows: Cell[][], visited: Set<string>): number {
  // Replace cell references with their values
  let processed = expr;
  
  // Find all cell references
  const cellRefs = expr.match(/[A-Z]+\d+/g) || [];
  for (const ref of cellRefs) {
    const cell = parseCellRef(ref);
    if (cell && rows[cell.row] && rows[cell.row][cell.col]) {
      const cellData = rows[cell.row][cell.col];
      let val: number;
      
      // If cell has a formula, evaluate it first
      if (cellData.value.startsWith("=")) {
        const result = evaluateFormula(cellData.value, rows, cell.row, cell.col, new Set(visited));
        val = parseFloat(result.value) || 0;
      } else {
        val = getCellNumericValue(cellData);
      }
      
      processed = processed.replace(new RegExp(ref, "g"), val.toString());
    }
  }
  
  // Evaluate the arithmetic expression
  try {
    // Simple evaluation (supports +, -, *, /, %)
    return evaluateSimpleArithmetic(processed);
  } catch {
    return 0;
  }
}

// Simple arithmetic evaluator
function evaluateSimpleArithmetic(expr: string): number {
  // Remove spaces
  expr = expr.replace(/\s/g, "");
  
  // Use Function constructor for safe evaluation
  try {
    // Only allow numbers and basic operators
    if (!/^[\d+\-*/.()%]+$/.test(expr)) {
      return 0;
    }
    return Function(`"use strict"; return (${expr})`)();
  } catch {
    return 0;
  }
}

// Recalculate all formulas in the spreadsheet
export function recalculateFormulas(rows: Cell[][]): Cell[][] {
  const newRows = rows.map(row => row.map(cell => ({ ...cell })));
  
  // First pass: evaluate all formulas
  for (let row = 0; row < newRows.length; row++) {
    for (let col = 0; col < newRows[row].length; col++) {
      const cell = newRows[row][col];
      if (cell.value.startsWith("=")) {
        const result = evaluateFormula(cell.value, newRows, row, col);
        cell.displayValue = result.error || result.value;
        cell.error = result.error;
      } else {
        cell.displayValue = cell.value;
        cell.error = undefined;
      }
    }
  }
  
  return newRows;
}
