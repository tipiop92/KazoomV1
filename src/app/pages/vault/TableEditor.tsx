import {
  Cell,
  numberToColumnLetter,
  recalculateFormulas,
  shiftFormulaRefsOnRowInsert,
  shiftFormulaRefsOnRowDelete,
  shiftFormulaRefsOnColInsert,
  shiftFormulaRefsOnColDelete
} from "../../../utils/spreadsheet";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Save, Plus, Download, Trash2, MoreVertical, Type, AlignLeft, AlignCenter, AlignRight, Check, Sigma, Palette, Bold, Italic } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PinModal } from "../../components/PinModal";

const COLUMN_WIDTH = 120;
const ROW_HEIGHT = 28;
const INITIAL_ROWS = 100;
const INITIAL_COLS = 17;

export function TableEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isContactTable = id?.startsWith("contact-");
  const contactId = isContactTable ? id.split("-")[1] : null;
  
  // Déterminer le titre initial
  const getInitialTitle = () => {
    if (id) {
      const storedTable = localStorage.getItem(`table-${id}`);
      if (storedTable) {
        try {
          const table = JSON.parse(storedTable);
          return table.title || "Nouveau tableau";
        } catch {
          return "Nouveau tableau";
        }
      }
    }
    return "Nouveau tableau";
  };
  
  const [title, setTitle] = useState(getInitialTitle());
  const [isSaved, setIsSaved] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaMode, setFormulaMode] = useState(false);
  const [selectedFormulaCells, setSelectedFormulaCells] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showBubbleColors, setShowBubbleColors] = useState(false);
  const [showFunctionsMenu, setShowFunctionsMenu] = useState(false);
  const [showBubbleFunctions, setShowBubbleFunctions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'back' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeRows = () => {
    // Vérifier si le tableur existe déjà dans localStorage
    if (id) {
      const storedTable = localStorage.getItem(`table-${id}`);
      if (storedTable) {
        // Le tableur existe, on le charge plus tard dans useEffect
        return Array(INITIAL_ROWS)
          .fill(null)
          .map(() =>
            Array(INITIAL_COLS)
              .fill(null)
              .map((): Cell => ({ value: "", displayValue: "" }))
          );
      }
    }
    
    // Nouveau tableur vierge
    return Array(INITIAL_ROWS)
      .fill(null)
      .map(() =>
        Array(INITIAL_COLS)
          .fill(null)
          .map((): Cell => ({ value: "", displayValue: "" }))
      );
  };

  const [rows, setRows] = useState<Cell[][]>(initializeRows);
  const [numCols, setNumCols] = useState(INITIAL_COLS);
  const [numRows, setNumRows] = useState(INITIAL_ROWS);

  // Load table from localStorage
  useEffect(() => {
    if (id && id !== "new") {
      try {
        const storedTable = localStorage.getItem(`table-${id}`);
        if (storedTable) {
          const table = JSON.parse(storedTable);
          setTitle(table.title || "Tableau");
          setRows(table.rows || initializeRows());
          setNumCols(table.numCols || INITIAL_COLS);
          setNumRows(table.numRows || INITIAL_ROWS);
        }
      } catch (error) {
        console.error("Error loading table:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    if (editingCell) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingCell]);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (formulaMode && editingCell && !(editingCell.row === rowIndex && editingCell.col === colIndex)) {
      const cellRef = `${numberToColumnLetter(colIndex)}${rowIndex + 1}`;
      
      // Insérer la référence à la bonne position (avant la dernière parenthèse si présent)
      let newValue = editValue;
      const lastParenIndex = editValue.lastIndexOf(')');
      
      if (lastParenIndex !== -1 && lastParenIndex === editValue.length - 1) {
        // Il y a une parenthèse fermante à la fin, insérer avant
        newValue = editValue.slice(0, lastParenIndex) + cellRef + editValue.slice(lastParenIndex);
      } else {
        // Pas de parenthèse fermante, ajouter à la fin
        newValue = editValue + cellRef;
      }
      
      setEditValue(newValue);
      setSelectedFormulaCells(prev => [...prev, cellRef]);
      
      handleCellChange(editingCell.row, editingCell.col, newValue);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      
      return;
    }
    
    setSelectedCell({ row: rowIndex, col: colIndex });
    setEditingCell({ row: rowIndex, col: colIndex });
    const value = rows[rowIndex][colIndex].value;
    setEditValue(value);
    setFormulaMode(value.startsWith("="));
    setSelectedFormulaCells([]);
  };

  const handleCellMouseDown = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
    // En mode formule, empêcher le blur de l'input
    if (formulaMode && editingCell && !(editingCell.row === rowIndex && editingCell.col === colIndex)) {
      e.preventDefault();
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], value };
    const recalculated = recalculateFormulas(newRows);
    setRows(recalculated);
    setIsSaved(false);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      handleCellChange(editingCell.row, editingCell.col, editValue);
    }
    setEditingCell(null);
    setFormulaMode(false);
    setSelectedFormulaCells([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCellChange(rowIndex, colIndex, editValue);
      setEditingCell(null);
      setFormulaMode(false);
      setSelectedFormulaCells([]);
      if (rowIndex < numRows - 1) {
        setSelectedCell({ row: rowIndex + 1, col: colIndex });
        setTimeout(() => setEditingCell({ row: rowIndex + 1, col: colIndex }), 0);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleCellChange(rowIndex, colIndex, editValue);
      setEditingCell(null);
      setFormulaMode(false);
      setSelectedFormulaCells([]);
      if (colIndex < numCols - 1) {
        setSelectedCell({ row: rowIndex, col: colIndex + 1 });
        setTimeout(() => setEditingCell({ row: rowIndex, col: colIndex + 1 }), 0);
      }
    } else if (e.key === "Escape") {
      setEditValue(rows[rowIndex][colIndex].value);
      setEditingCell(null);
      setFormulaMode(false);
      setSelectedFormulaCells([]);
    }
  };

  const insertColumnAfter = (colIndex: number) => {
    // Mettre à jour toutes les formules pour décaler les colonnes >= colIndex+1
    const updatedRows = rows.map((row) => 
      row.map((cell) => ({
        ...cell,
        value: shiftFormulaRefsOnColInsert(cell.value, colIndex + 1)
      }))
    );
    
    // Insérer la nouvelle colonne
    const newRows = updatedRows.map((row) => {
      const newRow = [...row];
      newRow.splice(colIndex + 1, 0, { value: "", displayValue: "" });
      return newRow;
    });
    
    setRows(recalculateFormulas(newRows));
    setNumCols(numCols + 1);
    setIsSaved(false);
    setHoveredColumn(null);
  };

  const insertRowAfter = (rowIndex: number) => {
    // Mettre à jour toutes les formules pour décaler les lignes >= rowIndex+1
    const updatedRows = rows.map((row) => 
      row.map((cell) => ({
        ...cell,
        value: shiftFormulaRefsOnRowInsert(cell.value, rowIndex + 1)
      }))
    );
    
    // Insérer la nouvelle ligne
    const newRow: Cell[] = Array(numCols).fill(null).map(() => ({ value: "", displayValue: "" }));
    const newRows = [...updatedRows];
    newRows.splice(rowIndex + 1, 0, newRow);
    
    setRows(recalculateFormulas(newRows));
    setNumRows(numRows + 1);
    setIsSaved(false);
    setHoveredRow(null);
  };

  const deleteColumn = (colIndex: number) => {
    if (numCols <= 1) {
      alert("Impossible de supprimer la dernière colonne");
      return;
    }
    if (confirm(`Supprimer la colonne ${numberToColumnLetter(colIndex)} ?`)) {
      // Mettre à jour toutes les formules pour gérer la suppression
      const updatedRows = rows.map((row) => 
        row.map((cell) => ({
          ...cell,
          value: shiftFormulaRefsOnColDelete(cell.value, colIndex)
        }))
      );
      
      // Supprimer la colonne
      const newRows = updatedRows.map((row) => {
        const newRow = [...row];
        newRow.splice(colIndex, 1);
        return newRow;
      });
      
      setRows(recalculateFormulas(newRows));
      setNumCols(numCols - 1);
      setIsSaved(false);
      setSelectedColumn(null);
    }
  };

  const deleteRow = (rowIndex: number) => {
    if (numRows <= 1) {
      alert("Impossible de supprimer la dernière ligne");
      return;
    }
    if (confirm(`Supprimer la ligne ${rowIndex + 1} ?`)) {
      // Mettre à jour toutes les formules pour gérer la suppression
      const updatedRows = rows.map((row) => 
        row.map((cell) => ({
          ...cell,
          value: shiftFormulaRefsOnRowDelete(cell.value, rowIndex)
        }))
      );
      
      // Supprimer la ligne
      const newRows = [...updatedRows];
      newRows.splice(rowIndex, 1);
      
      setRows(recalculateFormulas(newRows));
      setNumRows(numRows - 1);
      setIsSaved(false);
      setSelectedRow(null);
    }
  };

  const toggleBold = () => {
    if (!selectedCell) return;
    const newRows = [...rows];
    const cell = newRows[selectedCell.row][selectedCell.col];
    newRows[selectedCell.row][selectedCell.col] = { ...cell, bold: !cell.bold };
    setRows(newRows);
    setIsSaved(false);
  };

  const toggleItalic = () => {
    if (!selectedCell) return;
    const newRows = [...rows];
    const cell = newRows[selectedCell.row][selectedCell.col];
    newRows[selectedCell.row][selectedCell.col] = { ...cell, italic: !cell.italic };
    setRows(newRows);
    setIsSaved(false);
  };

  const setCellColor = (bgColor: string) => {
    if (!selectedCell) return;
    const newRows = [...rows];
    const cell = newRows[selectedCell.row][selectedCell.col];
    newRows[selectedCell.row][selectedCell.col] = { ...cell, bgColor };
    setRows(newRows);
    setIsSaved(false);
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    if (!selectedCell) return;
    const newRows = [...rows];
    const cell = newRows[selectedCell.row][selectedCell.col];
    newRows[selectedCell.row][selectedCell.col] = { ...cell, align };
    setRows(newRows);
    setIsSaved(false);
  };

  const insertFunction = (func: string) => {
    if (!selectedCell) return;
    
    const newRows = [...rows];
    const cell = newRows[selectedCell.row][selectedCell.col];
    
    let formula = "";
    switch (func) {
      case "SUM":
        formula = "=SUM()";
        break;
      case "AVERAGE":
        formula = "=AVERAGE()";
        break;
      case "MIN":
        formula = "=MIN()";
        break;
      case "MAX":
        formula = "=MAX()";
        break;
      case "COUNT":
        formula = "=COUNT()";
        break;
      case "IF":
        formula = "=IF(,,)";
        break;
    }
    
    newRows[selectedCell.row][selectedCell.col] = { ...cell, value: formula };
    const recalculated = recalculateFormulas(newRows);
    setRows(recalculated);
    setIsSaved(false);
    setShowFunctionsMenu(false);
    
    setEditValue(formula);
    setTimeout(() => {
      setEditingCell(selectedCell);
      setFormulaMode(true);
    }, 0);
  };

  const handleColumnHeaderPress = (colIndex: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setSelectedColumn(colIndex);
      setLongPressTimer(null);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleRowHeaderPress = (rowIndex: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setSelectedRow(rowIndex);
      setLongPressTimer(null);
    }, 500);
    setLongPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getBackRoute = () => {
    if (isContactTable && contactId) {
      return `/contacts/${contactId}`;
    }
    return "/vault/files";
  };

  const handleSave = () => {
    // Pour les tableurs de contact, demander le PIN avant d'enregistrer
    if (isContactTable) {
      setPendingAction('save');
      setShowPinModal(true);
    } else {
      performSave();
    }
  };

  const performSave = () => {
    // Save table to localStorage
    if (id) {
      const table = {
        id,
        title: title || "Sans titre",
        rows,
        numCols,
        numRows,
        date: new Date().toLocaleDateString("fr-FR")
      };
      localStorage.setItem(`table-${id}`, JSON.stringify(table));
      
      // If it's a contact table, update the contact's table list
      if (isContactTable && contactId) {
        try {
          const storedTables = localStorage.getItem(`contact-${contactId}-tables`);
          const tables = storedTables ? JSON.parse(storedTables) : [];
          const existingIndex = tables.findIndex((t: any) => t.id === id);
          
          const tableEntry = {
            id,
            title: title || "Sans titre",
            date: new Date().toLocaleDateString("fr-FR")
          };
          
          if (existingIndex >= 0) {
            tables[existingIndex] = tableEntry;
          } else {
            tables.push(tableEntry);
          }
          
          localStorage.setItem(`contact-${contactId}-tables`, JSON.stringify(tables));
          
          // Notifier les autres composants
          window.dispatchEvent(new Event('contact-documents-updated'));
        } catch (error) {
          console.error("Error updating contact tables:", error);
        }
      }
    }
    
    setIsSaved(true);
    setTimeout(() => {
      navigate(getBackRoute());
    }, 300);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    if (pendingAction === 'save') {
      performSave();
    } else if (pendingAction === 'back') {
      navigate(getBackRoute());
    }
    setPendingAction(null);
  };

  const handleBack = () => {
    if (!isSaved) {
      if (confirm("Tu as des modifications non enregistrées. Quitter quand même ?")) {
        // Pour les tableurs de contact, demander le PIN avant de quitter
        if (isContactTable) {
          setPendingAction('back');
          setShowPinModal(true);
        } else {
          navigate(getBackRoute());
        }
      }
    } else {
      // Pour les tableurs de contact, demander le PIN avant de quitter
      if (isContactTable) {
        setPendingAction('back');
        setShowPinModal(true);
      } else {
        navigate(getBackRoute());
      }
    }
  };

  const handleDelete = () => {
    if (confirm("Supprimer ce tableau définitivement ?")) {
      if (id) {
        localStorage.removeItem(`table-${id}`);
        
        // If it's a contact table, remove from contact's table list
        if (isContactTable && contactId) {
          try {
            const storedTables = localStorage.getItem(`contact-${contactId}-tables`);
            if (storedTables) {
              const tables = JSON.parse(storedTables);
              const updatedTables = tables.filter((t: any) => t.id !== id);
              localStorage.setItem(`contact-${contactId}-tables`, JSON.stringify(updatedTables));
            }
          } catch (error) {
            console.error("Error removing table from contact:", error);
          }
        }
      }
      navigate(getBackRoute());
    }
    setShowMainMenu(false);
  };

  const handleExport = () => {
    const csv = rows
      .map(row => 
        row.map(cell => {
          const val = cell.displayValue || cell.value;
          return val.includes(",") ? `"${val}"` : val;
        }).join(",")
      )
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowMainMenu(false);
  };

  const getSelectedCellInfo = () => {
    if (!selectedCell) return null;
    const cell = rows[selectedCell.row]?.[selectedCell.col];
    if (!cell) return null;
    
    return {
      ref: `${numberToColumnLetter(selectedCell.col)}${selectedCell.row + 1}`,
      value: cell.value,
      display: cell.displayValue || cell.value,
      isFormula: cell.value.startsWith("="),
      error: cell.error
    };
  };

  const cellInfo = getSelectedCellInfo();

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <div className="flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-900/95 border-b border-gray-800">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsSaved(false);
            }}
            className="text-base font-semibold bg-transparent border-none focus:outline-none text-white flex-1"
            placeholder="Nom du tableau"
          />
          <Button
            onClick={handleSave}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <Save className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMainMenu(true)}
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
        
        {cellInfo && (
          <div className="px-3 pb-2 flex items-center gap-2 text-sm">
            <div className="bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono text-xs min-w-[50px] text-center">
              {cellInfo.ref}
            </div>
            <div className="flex-1 bg-gray-800/50 px-3 py-1.5 rounded text-white font-mono text-xs overflow-x-auto">
              {cellInfo.isFormula ? (
                <span className="text-green-400">{cellInfo.value}</span>
              ) : (
                <span>{cellInfo.value || <span className="text-gray-600">Vide</span>}</span>
              )}
            </div>
            {cellInfo.error && (
              <span className="text-red-400 text-xs">{cellInfo.error}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-gray-950" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th
                  className="bg-gray-800 border border-gray-700 sticky left-0 z-20"
                  style={{ width: 50, height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
                ></th>
                
                {Array(numCols)
                  .fill(null)
                  .map((_, colIndex) => (
                    <th
                      key={colIndex}
                      className="bg-gray-800 border border-gray-700 relative group"
                      style={{ 
                        width: COLUMN_WIDTH, 
                        minWidth: COLUMN_WIDTH, 
                        maxWidth: COLUMN_WIDTH, 
                        height: ROW_HEIGHT, 
                        minHeight: ROW_HEIGHT 
                      }}
                      onMouseEnter={() => setHoveredColumn(colIndex)}
                      onMouseLeave={() => {
                        setHoveredColumn(null);
                        handlePressEnd();
                      }}
                      onTouchStart={(e) => handleColumnHeaderPress(colIndex, e)}
                      onTouchEnd={handlePressEnd}
                      onTouchCancel={handlePressEnd}
                      onMouseDown={(e) => handleColumnHeaderPress(colIndex, e)}
                      onMouseUp={handlePressEnd}
                    >
                      <div className="flex items-center justify-center h-full text-xs text-gray-400 font-semibold select-none">
                        {numberToColumnLetter(colIndex)}
                      </div>
                      
                      {(hoveredColumn === colIndex) && (
                        <button
                          onClick={() => insertColumnAfter(colIndex)}
                          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg z-30"
                          title="Insérer une colonne"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    className="bg-gray-800 border border-gray-700 sticky left-0 z-10 relative group"
                    style={{ width: 50, height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => {
                      setHoveredRow(null);
                      handlePressEnd();
                    }}
                    onTouchStart={(e) => handleRowHeaderPress(rowIndex, e)}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressEnd}
                    onMouseDown={(e) => handleRowHeaderPress(rowIndex, e)}
                    onMouseUp={handlePressEnd}
                  >
                    <div className="flex items-center justify-center h-full text-xs text-gray-500 font-mono select-none">
                      {rowIndex + 1}
                    </div>
                    
                    {(hoveredRow === rowIndex) && (
                      <button
                        onClick={() => insertRowAfter(rowIndex)}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg z-20"
                        title="Insérer une ligne"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </td>
                  
                  {row.map((cell, colIndex) => {
                    const isSelected =
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const isEditing =
                      editingCell?.row === rowIndex && editingCell?.col === colIndex;

                    const cellRef = `${numberToColumnLetter(colIndex)}${rowIndex + 1}`;
                    const isReferencedInFormula = formulaMode && selectedFormulaCells.includes(cellRef);

                    const cellStyle: React.CSSProperties = {
                      width: COLUMN_WIDTH,
                      minWidth: COLUMN_WIDTH,
                      maxWidth: COLUMN_WIDTH,
                      height: ROW_HEIGHT,
                      minHeight: ROW_HEIGHT,
                      textAlign: cell.align || "left",
                      fontWeight: cell.bold ? "bold" : "normal",
                      backgroundColor: cell.bgColor || undefined,
                    };

                    const displayValue = cell.displayValue || cell.value;
                    const isFormula = cell.value.startsWith("=");

                    return (
                      <td
                        key={colIndex}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseDown={(e) => handleCellMouseDown(e, rowIndex, colIndex)}
                        className={`border border-gray-700 px-2 transition-all cursor-pointer touch-manipulation ${
                          isSelected
                            ? "ring-2 ring-indigo-500 ring-inset bg-indigo-950/40"
                            : isReferencedInFormula
                            ? "ring-2 ring-green-400 ring-inset bg-green-950/40 shadow-lg shadow-green-500/20"
                            : "active:bg-gray-800/50"
                        } ${cell.error ? "bg-red-950/20" : ""}`}
                        style={cellStyle}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditValue(newValue);
                              if (newValue.startsWith("=") && !formulaMode) {
                                setFormulaMode(true);
                              } else if (!newValue.startsWith("=") && formulaMode) {
                                setFormulaMode(false);
                                setSelectedFormulaCells([]);
                              }
                            }}
                            onBlur={handleCellBlur}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            className="w-full h-full bg-transparent border-none focus:outline-none text-white text-sm px-0"
                            style={{
                              textAlign: cell.align || "left",
                              fontWeight: cell.bold ? "bold" : "normal",
                            }}
                          />
                        ) : (
                          <div className={`text-sm truncate flex items-center h-full ${
                            isFormula ? "text-white" : "text-white"
                          } ${cell.error ? "text-red-400" : ""}`}>
                            {cell.error || displayValue || "\u00A0"}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-3 py-2 flex items-center justify-between safe-area-bottom">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFormatMenu(true)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            disabled={!selectedCell}
          >
            <Type className="w-4 h-4 mr-2" />
            Format
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          {numCols} × {numRows}
        </div>
      </div>

      <AnimatePresence>
        {showMainMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMainMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 space-y-2 pb-6">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                >
                  <Download className="w-6 h-6 text-green-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Exporter CSV</div>
                    <div className="text-sm text-gray-400">Télécharger le tableau</div>
                  </div>
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl active:bg-red-600/20 transition-colors"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-red-400">Supprimer</div>
                    <div className="text-sm text-red-400/70">Action irréversible</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFunctionsMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFunctionsMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Insérer une fonction</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "SUM", desc: "Somme", icon: "Σ" },
                    { name: "AVERAGE", desc: "Moyenne", icon: "μ" },
                    { name: "MIN", desc: "Minimum", icon: "↓" },
                    { name: "MAX", desc: "Maximum", icon: "↑" },
                    { name: "COUNT", desc: "Compter", icon: "#" },
                    { name: "IF", desc: "Condition", icon: "?" },
                  ].map((func) => (
                    <button
                      key={func.name}
                      onClick={() => insertFunction(func.name)}
                      className="flex flex-col items-center gap-2 p-4 bg-indigo-600/10 border border-indigo-600/30 rounded-xl active:bg-indigo-600/20 transition-colors"
                    >
                      <div className="text-2xl">{func.icon}</div>
                      <div className="text-sm font-semibold text-white">{func.name}</div>
                      <div className="text-xs text-gray-400">{func.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFormatMenu && selectedCell && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormatMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 space-y-3 pb-6">
                <button
                  onClick={toggleBold}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    rows[selectedCell.row]?.[selectedCell.col]?.bold
                      ? "bg-purple-600/20 border border-purple-600/40"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}
                >
                  <Bold className="w-6 h-6 text-purple-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Gras</div>
                  </div>
                </button>

                <button
                  onClick={toggleItalic}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    rows[selectedCell.row]?.[selectedCell.col]?.italic
                      ? "bg-purple-600/20 border border-purple-600/40"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}
                >
                  <Italic className="w-6 h-6 text-purple-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Italique</div>
                  </div>
                </button>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2 px-1">Couleur de fond</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { color: "transparent", label: "Aucune", bg: "bg-gray-800" },
                      { color: "#1e3a8a", label: "Bleu", bg: "bg-blue-800" },
                      { color: "#15803d", label: "Vert", bg: "bg-green-700" },
                      { color: "#b91c1c", label: "Rouge", bg: "bg-red-700" },
                      { color: "#a16207", label: "Jaune", bg: "bg-yellow-700" },
                      { color: "#7e22ce", label: "Violet", bg: "bg-purple-700" },
                      { color: "#be123c", label: "Rose", bg: "bg-rose-700" },
                      { color: "#ea580c", label: "Orange", bg: "bg-orange-600" },
                      { color: "#0891b2", label: "Cyan", bg: "bg-cyan-600" },
                      { color: "#4b5563", label: "Gris", bg: "bg-gray-600" },
                      { color: "#0f172a", label: "Noir", bg: "bg-slate-900" },
                      { color: "#f8fafc", label: "Blanc", bg: "bg-slate-50" },
                    ].map((item) => (
                      <button
                        key={item.color}
                        onClick={() => {
                          setCellColor(item.color === "transparent" ? "" : item.color);
                          setShowFormatMenu(false);
                        }}
                        className={`w-full h-12 rounded-lg ${item.bg} border-2 transition-all ${
                          (item.color === "transparent" && !rows[selectedCell.row]?.[selectedCell.col]?.bgColor) ||
                          rows[selectedCell.row]?.[selectedCell.col]?.bgColor === item.color
                            ? "border-white scale-110"
                            : "border-transparent hover:border-gray-500"
                        }`}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2 px-1">Alignement</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setAlignment("left");
                        setShowFormatMenu(false);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                        rows[selectedCell.row]?.[selectedCell.col]?.align === "left"
                          ? "bg-indigo-600/20 border border-indigo-600/40"
                          : "bg-gray-800/50 border border-gray-700"
                      }`}
                    >
                      <AlignLeft className="w-6 h-6 text-gray-300" />
                      <span className="text-xs text-gray-400">Gauche</span>
                    </button>
                    <button
                      onClick={() => {
                        setAlignment("center");
                        setShowFormatMenu(false);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                        rows[selectedCell.row]?.[selectedCell.col]?.align === "center"
                          ? "bg-indigo-600/20 border border-indigo-600/40"
                          : "bg-gray-800/50 border border-gray-700"
                      }`}
                    >
                      <AlignCenter className="w-6 h-6 text-gray-300" />
                      <span className="text-xs text-gray-400">Centre</span>
                    </button>
                    <button
                      onClick={() => {
                        setAlignment("right");
                        setShowFormatMenu(false);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                        rows[selectedCell.row]?.[selectedCell.col]?.align === "right"
                          ? "bg-indigo-600/20 border border-indigo-600/40"
                          : "bg-gray-800/50 border border-gray-700"
                      }`}
                    >
                      <AlignRight className="w-6 h-6 text-gray-300" />
                      <span className="text-xs text-gray-400">Droite</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedColumn !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedColumn(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Colonne {numberToColumnLetter(selectedColumn)}</h3>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      insertColumnAfter(selectedColumn);
                      setSelectedColumn(null);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl active:bg-blue-600/20 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-blue-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-white">Insérer une colonne après</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => deleteColumn(selectedColumn)}
                    className="w-full flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl active:bg-red-600/20 transition-colors"
                  >
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-red-400">Supprimer cette colonne</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRow !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRow(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Ligne {selectedRow + 1}</h3>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      insertRowAfter(selectedRow);
                      setSelectedRow(null);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl active:bg-blue-600/20 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-blue-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-white">Insérer une ligne après</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => deleteRow(selectedRow)}
                    className="w-full flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl active:bg-red-600/20 transition-colors"
                  >
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-red-400">Supprimer cette ligne</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formulaMode && editingCell && (
          <>
            {showBubbleFunctions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed bottom-[200px] left-1/2 -translate-x-1/2 bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-700 z-50 p-2 w-[280px]"
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "SUM", desc: "Somme", icon: "Σ" },
                    { name: "AVERAGE", desc: "Moyenne", icon: "μ" },
                    { name: "MIN", desc: "Minimum", icon: "↓" },
                    { name: "MAX", desc: "Maximum", icon: "↑" },
                    { name: "COUNT", desc: "Compter", icon: "#" },
                    { name: "IF", desc: "Condition", icon: "?" },
                  ].map((func) => (
                    <button
                      key={func.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setEditValue(prev => prev + func.name + "()");
                        setShowBubbleFunctions(false);
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      }}
                      className="flex flex-col items-center gap-1 p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/30 rounded-xl active:bg-indigo-600/30 transition-colors"
                    >
                      <div className="text-xl">{func.icon}</div>
                      <div className="text-xs font-semibold text-white">{func.name}</div>
                      <div className="text-[10px] text-gray-400">{func.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-2xl shadow-2xl border border-indigo-500/50 z-50 p-1"
            >
              <div className="flex items-center gap-1">
                {[
                  { op: "+", label: "Addition" },
                  { op: "-", label: "Soustraction" },
                  { op: "*", label: "Multiplication" },
                  { op: "/", label: "Division" },
                  { op: "%", label: "Pourcentage" },
                ].map((item) => (
                  <button
                    key={item.op}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setEditValue(prev => {
                        // Insérer l'opérateur avant la dernière parenthèse si présente
                        const lastParenIndex = prev.lastIndexOf(')');
                        if (lastParenIndex !== -1 && lastParenIndex === prev.length - 1) {
                          return prev.slice(0, lastParenIndex) + item.op + prev.slice(lastParenIndex);
                        }
                        return prev + item.op;
                      });
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 0);
                    }}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
                    title={item.label}
                  >
                    <span className="text-white text-xl font-bold">{item.op}</span>
                  </button>
                ))}
                
                <div className="w-px h-10 bg-white/20 mx-1" />
                
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowBubbleFunctions(!showBubbleFunctions)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border ${
                    showBubbleFunctions
                      ? "bg-purple-500/30 border-purple-400/40"
                      : "bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/30"
                  }`}
                  title="Insérer une fonction"
                >
                  <Sigma className="w-6 h-6 text-purple-300" />
                </button>
                
                <div className="w-px h-10 bg-white/20 mx-1" />
                
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (editingCell) {
                      handleCellChange(editingCell.row, editingCell.col, editValue);
                      setEditingCell(null);
                      setFormulaMode(false);
                      setSelectedFormulaCells([]);
                      setShowBubbleFunctions(false);
                    }
                  }}
                  className="w-12 h-12 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border border-green-400/30"
                  title="Valider la formule (Enter)"
                >
                  <Check className="w-6 h-6 text-green-400" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
        alwaysAsk={true}
        title="Confirmer l'enregistrement"
      />
    </div>
  );
}