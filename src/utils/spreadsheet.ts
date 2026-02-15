export interface Cell {
  value: string;
  displayValue: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  bgColor?: string;
  textColor?: string;
  error?: string;
}

// Convert column index to letter (0 -> A, 25 -> Z, 26 -> AA, etc.)
export function numberToColumnLetter(colIndex: number): string {
  let letter = "";
  let num = colIndex;
  while (num >= 0) {
    letter = String.fromCharCode((num % 26) + 65) + letter;
    num = Math.floor(num / 26) - 1;
  }
  return letter;
}

// Convert column letter to index (A -> 0, Z -> 25, AA -> 26, etc.)
export function columnLetterToNumber(letter: string): number {
  let num = 0;
  for (let i = 0; i < letter.length; i++) {
    num = num * 26 + (letter.charCodeAt(i) - 64);
  }
  return num - 1;
}

// Parse cell reference (e.g., "A1" -> { col: 0, row: 0 })
function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = columnLetterToNumber(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { col, row };
}

// Parse range (e.g., "A1:B3" -> list of cell refs)
function parseRange(range: string): string[] {
  const parts = range.split(":");
  if (parts.length !== 2) return [];
  
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  
  if (!start || !end) return [];
  
  const cells: string[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      cells.push(`${numberToColumnLetter(col)}${row + 1}`);
    }
  }
  
  return cells;
}

// Get numeric value from a cell
function getCellNumericValue(
  cellRef: string,
  rows: Cell[][]
): { value: number; error?: string } {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return { value: 0, error: "#REF!" };
  
  const { col, row } = parsed;
  if (row < 0 || row >= rows.length || col < 0 || col >= rows[0].length) {
    return { value: 0, error: "#REF!" };
  }
  
  const cell = rows[row][col];
  const val = cell.displayValue || cell.value;
  
  if (val === "") return { value: 0 };
  
  const num = parseFloat(val);
  if (isNaN(num)) {
    return { value: 0, error: "#VALUE!" };
  }
  
  return { value: num };
}

// Evaluate a formula
export function evaluateFormula(
  formula: string,
  rows: Cell[][],
  currentRow: number,
  currentCol: number,
  visitedCells: Set<string> = new Set()
): { result: string; error?: string; deps: string[] } {
  if (!formula.startsWith("=")) {
    return { result: formula, deps: [] };
  }
  
  const currentCellRef = `${numberToColumnLetter(currentCol)}${currentRow + 1}`;
  
  // Cycle detection
  if (visitedCells.has(currentCellRef)) {
    return { result: "#CYCLE!", error: "#CYCLE!", deps: [] };
  }
  
  visitedCells.add(currentCellRef);
  
  const expression = formula.substring(1).trim();
  const deps: string[] = [];
  
  try {
    // Handle functions
    const funcMatch = expression.match(/^(SUM|AVERAGE|MIN|MAX|COUNT|IF)\s*\((.*)\)$/i);
    
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const args = funcMatch[2];
      
      if (funcName === "IF") {
        // Simple IF: IF(condition, trueValue, falseValue)
        const ifParts = args.split(",").map((s) => s.trim());
        if (ifParts.length !== 3) {
          return { result: "#VALUE!", error: "#VALUE!", deps };
        }
        
        // Evaluate condition (simple: A1>10, B2=5, etc.)
        const condResult = evaluateExpression(ifParts[0], rows, visitedCells, deps);
        if (condResult.error) {
          return { result: condResult.error, error: condResult.error, deps };
        }
        
        const condition = parseFloat(condResult.value) !== 0;
        const valueToEval = condition ? ifParts[1] : ifParts[2];
        
        const result = evaluateExpression(valueToEval, rows, visitedCells, deps);
        if (result.error) {
          return { result: result.error, error: result.error, deps };
        }
        
        return { result: result.value, deps };
      }
      
      // Get values from range or list
      let values: number[] = [];
      
      // Check if it's a range (A1:B3)
      if (args.includes(":")) {
        const cells = parseRange(args);
        deps.push(...cells);
        
        for (const cellRef of cells) {
          const parsed = parseCellRef(cellRef);
          if (!parsed) continue;
          
          const { col, row } = parsed;
          if (row < 0 || row >= rows.length || col < 0 || col >= rows[0].length) {
            continue;
          }
          
          const cell = rows[row][col];
          
          // Recursive evaluation for formulas
          if (cell.value.startsWith("=")) {
            const evalResult = evaluateFormula(
              cell.value,
              rows,
              row,
              col,
              new Set(visitedCells)
            );
            if (evalResult.error) {
              return { result: evalResult.error, error: evalResult.error, deps };
            }
            const num = parseFloat(evalResult.result);
            if (!isNaN(num)) values.push(num);
          } else {
            const val = cell.value;
            if (val !== "") {
              const num = parseFloat(val);
              if (!isNaN(num)) values.push(num);
            }
          }
        }
      } else {
        // List of cells or values: A1, B2, 10, etc.
        const items = args.split(",").map((s) => s.trim());
        
        for (const item of items) {
          const parsed = parseCellRef(item);
          if (parsed) {
            deps.push(item);
            const numVal = getCellNumericValue(item, rows);
            if (numVal.error) {
              return { result: numVal.error, error: numVal.error, deps };
            }
            values.push(numVal.value);
          } else {
            const num = parseFloat(item);
            if (!isNaN(num)) values.push(num);
          }
        }
      }
      
      // Apply function
      let result: number;
      
      switch (funcName) {
        case "SUM":
          result = values.reduce((sum, val) => sum + val, 0);
          break;
        case "AVERAGE":
          result = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          break;
        case "MIN":
          result = values.length > 0 ? Math.min(...values) : 0;
          break;
        case "MAX":
          result = values.length > 0 ? Math.max(...values) : 0;
          break;
        case "COUNT":
          result = values.length;
          break;
        default:
          return { result: "#VALUE!", error: "#VALUE!", deps };
      }
      
      return { result: result.toString(), deps };
    }
    
    // Simple expression (A1 + B2, A1 - B2, etc.)
    const evalResult = evaluateExpression(expression, rows, visitedCells, deps);
    if (evalResult.error) {
      return { result: evalResult.error, error: evalResult.error, deps };
    }
    
    return { result: evalResult.value, deps };
  } catch (error) {
    return { result: "#ERROR!", error: "#ERROR!", deps };
  }
}

// Evaluate a simple expression
function evaluateExpression(
  expr: string,
  rows: Cell[][],
  visitedCells: Set<string>,
  deps: string[]
): { value: string; error?: string } {
  try {
    // Replace cell references with their values
    let processedExpr = expr;
    
    // Find all cell references
    const cellRefs = expr.match(/[A-Z]+\d+/g) || [];
    
    for (const cellRef of cellRefs) {
      deps.push(cellRef);
      const parsed = parseCellRef(cellRef);
      if (!parsed) {
        return { value: "#REF!", error: "#REF!" };
      }
      
      const { col, row } = parsed;
      if (row < 0 || row >= rows.length || col < 0 || col >= rows[0].length) {
        return { value: "#REF!", error: "#REF!" };
      }
      
      const cell = rows[row][col];
      let cellValue: string;
      
      // Recursive evaluation for formulas
      if (cell.value.startsWith("=")) {
        const evalResult = evaluateFormula(
          cell.value,
          rows,
          row,
          col,
          new Set(visitedCells)
        );
        if (evalResult.error) {
          return { value: evalResult.error, error: evalResult.error };
        }
        cellValue = evalResult.result;
      } else {
        cellValue = cell.value;
      }
      
      if (cellValue === "") {
        cellValue = "0";
      }
      
      const num = parseFloat(cellValue);
      if (isNaN(num)) {
        return { value: "#VALUE!", error: "#VALUE!" };
      }
      
      // Replace in expression
      processedExpr = processedExpr.replace(new RegExp(cellRef, "g"), num.toString());
    }
    
    // Evaluate the mathematical expression
    const result = evaluateMathExpression(processedExpr);
    
    if (result.error) {
      return { value: result.error, error: result.error };
    }
    
    return { value: result.value.toString() };
  } catch (error) {
    return { value: "#ERROR!", error: "#ERROR!" };
  }
}

// Simple math expression evaluator
function evaluateMathExpression(expr: string): { value: number; error?: string } {
  try {
    // Remove whitespace
    expr = expr.replace(/\s/g, "");
    
    // Check for division by zero
    if (/\/0(?![.]|\d)/.test(expr)) {
      return { value: 0, error: "#DIV/0!" };
    }
    
    // Handle percentage (convert 10% to 0.1)
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, (match, num) => {
      return (parseFloat(num) / 100).toString();
    });
    
    // Use Function constructor for safe evaluation (only math operations)
    // This is safer than eval() as it doesn't have access to scope
    const func = new Function(`return ${expr}`);
    const result = func();
    
    if (!isFinite(result)) {
      return { value: 0, error: "#DIV/0!" };
    }
    
    return { value: result };
  } catch (error) {
    return { value: 0, error: "#ERROR!" };
  }
}

// Recalculate all formulas in the spreadsheet
export function recalculateFormulas(rows: Cell[][]): Cell[][] {
  const newRows = rows.map((row) => row.map((cell) => ({ ...cell })));
  
  // Build dependency graph
  const cellDeps: Map<string, string[]> = new Map();
  
  for (let row = 0; row < newRows.length; row++) {
    for (let col = 0; col < newRows[row].length; col++) {
      const cell = newRows[row][col];
      if (cell.value.startsWith("=")) {
        const cellRef = `${numberToColumnLetter(col)}${row + 1}`;
        const result = evaluateFormula(cell.value, newRows, row, col);
        cellDeps.set(cellRef, result.deps);
      }
    }
  }
  
  // Recalculate formulas
  for (let row = 0; row < newRows.length; row++) {
    for (let col = 0; col < newRows[row].length; col++) {
      const cell = newRows[row][col];
      
      if (cell.value.startsWith("=")) {
        const result = evaluateFormula(cell.value, newRows, row, col);
        cell.displayValue = result.result;
        cell.error = result.error;
      } else {
        cell.displayValue = cell.value;
        cell.error = undefined;
      }
    }
  }
  
  return newRows;
}

// Helper: Shift a cell reference when inserting a row
function shiftCellRefOnRowInsert(cellRef: string, insertedRow: number): string {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return cellRef;
  
  const { col, row } = parsed;
  // If the referenced row is after or at the insertion point, shift it down
  if (row >= insertedRow) {
    return `${numberToColumnLetter(col)}${row + 2}`;
  }
  return cellRef;
}

// Helper: Shift a cell reference when deleting a row
function shiftCellRefOnRowDelete(cellRef: string, deletedRow: number): string | null {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return cellRef;
  
  const { col, row } = parsed;
  
  // If the reference points to the deleted row, it becomes invalid
  if (row === deletedRow) {
    return null;
  }
  
  // If the referenced row is after the deleted row, shift it up
  if (row > deletedRow) {
    return `${numberToColumnLetter(col)}${row}`;
  }
  
  return cellRef;
}

// Helper: Shift a cell reference when inserting a column
function shiftCellRefOnColInsert(cellRef: string, insertedCol: number): string {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return cellRef;
  
  const { col, row } = parsed;
  // If the referenced column is after or at the insertion point, shift it right
  if (col >= insertedCol) {
    return `${numberToColumnLetter(col + 1)}${row + 1}`;
  }
  return cellRef;
}

// Helper: Shift a cell reference when deleting a column
function shiftCellRefOnColDelete(cellRef: string, deletedCol: number): string | null {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return cellRef;
  
  const { col, row } = parsed;
  
  // If the reference points to the deleted column, it becomes invalid
  if (col === deletedCol) {
    return null;
  }
  
  // If the referenced column is after the deleted column, shift it left
  if (col > deletedCol) {
    return `${numberToColumnLetter(col - 1)}${row + 1}`;
  }
  
  return cellRef;
}

// Update formula references when inserting a row
export function shiftFormulaRefsOnRowInsert(formula: string, insertedRow: number): string {
  if (!formula.startsWith("=")) return formula;
  
  return formula.replace(/([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/g, (match, col1, row1, col2, row2) => {
    if (col2 && row2) {
      const newStart = shiftCellRefOnRowInsert(`${col1}${row1}`, insertedRow);
      const newEnd = shiftCellRefOnRowInsert(`${col2}${row2}`, insertedRow);
      return `${newStart}:${newEnd}`;
    } else {
      return shiftCellRefOnRowInsert(`${col1}${row1}`, insertedRow);
    }
  });
}

// Update formula references when deleting a row
export function shiftFormulaRefsOnRowDelete(formula: string, deletedRow: number): string {
  if (!formula.startsWith("=")) return formula;
  
  let hasRefError = false;
  
  const updated = formula.replace(/([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/g, (match, col1, row1, col2, row2) => {
    if (col2 && row2) {
      const newStart = shiftCellRefOnRowDelete(`${col1}${row1}`, deletedRow);
      const newEnd = shiftCellRefOnRowDelete(`${col2}${row2}`, deletedRow);
      
      if (newStart === null || newEnd === null) {
        hasRefError = true;
        return "#REF!";
      }
      
      return `${newStart}:${newEnd}`;
    } else {
      const newRef = shiftCellRefOnRowDelete(`${col1}${row1}`, deletedRow);
      
      if (newRef === null) {
        hasRefError = true;
        return "#REF!";
      }
      
      return newRef;
    }
  });
  
  if (hasRefError) {
    return "=#REF!";
  }
  
  return updated;
}

// Update formula references when inserting a column
export function shiftFormulaRefsOnColInsert(formula: string, insertedCol: number): string {
  if (!formula.startsWith("=")) return formula;
  
  return formula.replace(/([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/g, (match, col1, row1, col2, row2) => {
    if (col2 && row2) {
      const newStart = shiftCellRefOnColInsert(`${col1}${row1}`, insertedCol);
      const newEnd = shiftCellRefOnColInsert(`${col2}${row2}`, insertedCol);
      return `${newStart}:${newEnd}`;
    } else {
      return shiftCellRefOnColInsert(`${col1}${row1}`, insertedCol);
    }
  });
}

// Update formula references when deleting a column
export function shiftFormulaRefsOnColDelete(formula: string, deletedCol: number): string {
  if (!formula.startsWith("=")) return formula;
  
  let hasRefError = false;
  
  const updated = formula.replace(/([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/g, (match, col1, row1, col2, row2) => {
    if (col2 && row2) {
      const newStart = shiftCellRefOnColDelete(`${col1}${row1}`, deletedCol);
      const newEnd = shiftCellRefOnColDelete(`${col2}${row2}`, deletedCol);
      
      if (newStart === null || newEnd === null) {
        hasRefError = true;
        return "#REF!";
      }
      
      return `${newStart}:${newEnd}`;
    } else {
      const newRef = shiftCellRefOnColDelete(`${col1}${row1}`, deletedCol);
      
      if (newRef === null) {
        hasRefError = true;
        return "#REF!";
      }
      
      return newRef;
    }
  });
  
  if (hasRefError) {
    return "=#REF!";
  }
  
  return updated;
}
