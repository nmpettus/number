import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// Generate a puzzle for the inner grid (innerSize x innerSize)
function generatePuzzle(innerSize) {
  const puzzleNumbers = [];
  const solutionSelection = [];
  for (let i = 0; i < innerSize; i++) {
    puzzleNumbers[i] = [];
    solutionSelection[i] = [];
    for (let j = 0; j < innerSize; j++) {
      // Generate numbers from 1 to 9
      puzzleNumbers[i][j] = Math.floor(Math.random() * 9) + 1;
      solutionSelection[i][j] = false;
    }
  }
  // Ensure each row has at least one required cell.
  for (let i = 0; i < innerSize; i++) {
    const randIndex = Math.floor(Math.random() * innerSize);
    solutionSelection[i][randIndex] = true;
  }
  // Randomly set additional cells as required (probability 0.4).
  for (let i = 0; i < innerSize; i++) {
    for (let j = 0; j < innerSize; j++) {
      if (Math.random() < 0.4) {
        solutionSelection[i][j] = true;
      }
    }
  }
  // Ensure each column has at least one required cell.
  for (let j = 0; j < innerSize; j++) {
    let hasTrue = false;
    for (let i = 0; i < innerSize; i++) {
      if (solutionSelection[i][j]) {
        hasTrue = true;
        break;
      }
    }
    if (!hasTrue) {
      const randRow = Math.floor(Math.random() * innerSize);
      solutionSelection[randRow][j] = true;
    }
  }
  return { puzzleNumbers, solutionSelection };
}

// Calculate target sums based on puzzleNumbers and solutionSelection.
function calculateTargets(puzzleNumbers, solutionSelection) {
  const innerSize = puzzleNumbers.length;
  const targetRows = Array(innerSize).fill(0);
  const targetCols = Array(innerSize).fill(0);
  for (let i = 0; i < innerSize; i++) {
    for (let j = 0; j < innerSize; j++) {
      if (solutionSelection[i][j]) {
        targetRows[i] += puzzleNumbers[i][j];
        targetCols[j] += puzzleNumbers[i][j];
      }
    }
  }
  return { targetRows, targetCols };
}

function App() {
  // Randomly choose inner puzzle size among 5, 6, or 7.
  const [innerSize, setInnerSize] = useState(() => {
    const sizes = [5, 6, 7];
    return sizes[Math.floor(Math.random() * sizes.length)];
  });
  const gridSize = innerSize + 2; // Total grid size including border cells

  // State for cell size (in pixels) for responsive design.
  const [cellSize, setCellSize] = useState(50);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setCellSize(30); // Smaller cells on mobile devices
      } else {
        setCellSize(50);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial cell size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Other state variables.
  const [puzzleNumbers, setPuzzleNumbers] = useState([]);
  const [solutionSelection, setSolutionSelection] = useState([]);
  const [userSelection, setUserSelection] = useState([]);
  const [targets, setTargets] = useState({ targetRows: [], targetCols: [] });
  const [solvedRows, setSolvedRows] = useState([]);
  const [solvedCols, setSolvedCols] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize the puzzle with a given innerSize.
  const initializePuzzle = (newInnerSize = innerSize) => {
    const { puzzleNumbers: pn, solutionSelection: ss } = generatePuzzle(newInnerSize);
    console.log("Generated puzzleNumbers:", pn);
    console.log("Generated solutionSelection:", ss);
    setPuzzleNumbers(pn);
    setSolutionSelection(ss);
    setTargets(calculateTargets(pn, ss));

    const initUserSel = [];
    for (let i = 0; i < newInnerSize; i++) {
      initUserSel[i] = [];
      for (let j = 0; j < newInnerSize; j++) {
        initUserSel[i][j] = false;
      }
    }
    setUserSelection(initUserSel);
    setSolvedRows(Array(newInnerSize).fill(false));
    setSolvedCols(Array(newInnerSize).fill(false));
    setMistakes(0);
    setPuzzleCompleted(false);
  };

  // Run initialization when the component mounts.
  useEffect(() => {
    initializePuzzle();
  }, []);

  // Check if each row or column is solved by comparing userSelection to solutionSelection.
  const checkSolution = (currentSelection) => {
    const newSolvedRows = [];
    const newSolvedCols = [];
    for (let i = 0; i < innerSize; i++) {
      let rowSolved = true;
      for (let j = 0; j < innerSize; j++) {
        if (currentSelection[i][j] !== solutionSelection[i][j]) {
          rowSolved = false;
          break;
        }
      }
      newSolvedRows[i] = rowSolved;
    }
    for (let j = 0; j < innerSize; j++) {
      let colSolved = true;
      for (let i = 0; i < innerSize; i++) {
        if (currentSelection[i][j] !== solutionSelection[i][j]) {
          colSolved = false;
          break;
        }
      }
      newSolvedCols[j] = colSolved;
    }
    setSolvedRows(newSolvedRows);
    setSolvedCols(newSolvedCols);
    console.log("Solved Rows:", newSolvedRows, "Solved Cols:", newSolvedCols);

    // If the entire puzzle is solved, trigger confetti and update score.
    if (newSolvedRows.every(r => r) && newSolvedCols.every(c => c) && !puzzleCompleted) {
      setPuzzleCompleted(true);
      setScore(prev => prev + 1);
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Toggle a cell's selection.
  const toggleCell = (i, j) => {
    const newUserSelection = userSelection.map(row => [...row]);
    const newValue = !newUserSelection[i][j];
    newUserSelection[i][j] = newValue;
    // Register a mistake if the user turns on a cell that is not required.
    if (newValue && !solutionSelection[i][j]) {
      setMistakes(prev => prev + 1);
    }
    setUserSelection(newUserSelection);
    checkSolution(newUserSelection);
  };

  // Function to move to the next puzzle without reloading.
  const nextPuzzle = () => {
    const sizes = [5, 6, 7];
    const newSize = sizes[Math.floor(Math.random() * sizes.length)];
    setInnerSize(newSize);
    initializePuzzle(newSize);
  };

  // Wait until state arrays are populated before rendering.
  if (
    puzzleNumbers.length === 0 ||
    userSelection.length === 0 ||
    solvedRows.length === 0 ||
    solvedCols.length === 0 ||
    targets.targetRows.length === 0 ||
    targets.targetCols.length === 0
  ) {
    return <div>Loading puzzle...</div>;
  }

  // Build the full grid (including border cells).
  const cellsNested = Array.from({ length: gridSize }).map((_, i) =>
    Array.from({ length: gridSize }).map((_, j) => {
      // Top border (excluding corners)
      if (i === 0 && j > 0 && j < gridSize - 1) {
        return (
          <div key={`${i}-${j}`} className="grid-cell target-cell">
            {targets.targetCols[j - 1]}
          </div>
        );
      }
      // Bottom border (excluding corners)
      if (i === gridSize - 1 && j > 0 && j < gridSize - 1) {
        return (
          <div key={`${i}-${j}`} className="grid-cell target-cell">
            {targets.targetCols[j - 1]}
          </div>
        );
      }
      // Left border (excluding corners)
      if (j === 0 && i > 0 && i < gridSize - 1) {
        return (
          <div key={`${i}-${j}`} className="grid-cell target-cell">
            {targets.targetRows[i - 1]}
          </div>
        );
      }
      // Right border (excluding corners)
      if (j === gridSize - 1 && i > 0 && i < gridSize - 1) {
        return (
          <div key={`${i}-${j}`} className="grid-cell target-cell">
            {targets.targetRows[i - 1]}
          </div>
        );
      }
      // Corner cells.
      if (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1) {
        return <div key={`${i}-${j}`} className="grid-cell target-cell"></div>;
      }
      // Inner cell: adjust indices by 1.
      const innerI = i - 1;
      const innerJ = j - 1;
      const rowSolved = solvedRows[innerI];
      const colSolved = solvedCols[innerJ];
      const solved = rowSolved || colSolved;
      let content = puzzleNumbers[innerI][innerJ];
      let cellClass = "grid-cell";
      if (solved) {
        cellClass += " solved";
        if (!userSelection[innerI][innerJ]) {
          content = "";
        }
      } else {
        if (userSelection[innerI][innerJ]) {
          cellClass += " selected";
        }
      }
      return (
        <div
          key={`${i}-${j}`}
          className={cellClass}
          onClick={() => toggleCell(innerI, innerJ)}
        >
          {content}
        </div>
      );
    })
  );
  const cells = cellsNested.flat();
  
// Increase extraMargin so that there's enough space on both sides.
// For desktop (cellSize 50) we add 60px extra; for mobile (cellSize 30), add 30px.
const extraMargin = cellSize === 50 ? 60 : 30;
const containerWidth = gridSize * cellSize + extraMargin;

return (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Number Sum Game</h1>
    <div style={{ marginBottom: '10px', fontSize: '18px' }}>
      Mistakes: {mistakes} | Score: {score}
    </div>
    {/* Outer frame container */}
    <div
      style={{
        border: '2px solid #ccc',
        padding: '10px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        // Optionally, you can set a maxWidth if you wish
        maxWidth: '100%'
      }}
    >
      {/* The grid container uses display: grid and its natural width */}
      <div
        className="grid-container"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          boxSizing: 'border-box',
          backgroundColor: '#fff'
        }}
      >
        {cells}
      </div>
    </div>
    <button onClick={nextPuzzle}>Next Puzzle</button>
  </div>
);

}

export default App;

