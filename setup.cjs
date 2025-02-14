const fs = require('fs');
const path = require('path');

// Ensure the src directory exists.
const dirs = ['src'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// package.json
const packageJson = {
  name: 'number-sum-game',
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview'
  },
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0'
  },
  devDependencies: {
    '@vitejs/plugin-react': '^4.2.0',
    vite: '^5.0.0'
  }
};
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// vite.config.js
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
});`;
fs.writeFileSync('vite.config.js', viteConfig);

// index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Number Sum Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
fs.writeFileSync('index.html', indexHtml);

// src/main.jsx
const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
fs.writeFileSync(path.join('src', 'main.jsx'), mainJsx);

// src/index.css
const indexCss = `body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background-color: #f0f0f0;
}

.grid-container {
  display: grid;
  gap: 5px;
  background-color: #fff;
  border: 2px solid #333;
  padding: 10px;
}

.grid-cell {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  font-size: 18px;
}

.target-cell {
  background-color: #e0e0e0;
  font-weight: bold;
}

input {
  width: 40px;
  height: 40px;
  text-align: center;
  border: none;
  font-size: 16px;
}

.solved-message {
  position: absolute;
  top: 20px;
  font-size: 24px;
  color: green;
}`;
fs.writeFileSync(path.join('src', 'index.css'), indexCss);

// src/App.jsx
const appJsx = `import React, { useState, useEffect } from 'react';

function generateTargetValues(grid) {
  const gridSize = grid.length;
  const targets = {
    row: Array(gridSize).fill(0),
    col: Array(gridSize).fill(0),
  };

  for (let i = 1; i < gridSize - 1; i++) {
    for (let j = 1; j < gridSize - 1; j++) {
      const value = Number(grid[i][j]) || 0;
      targets.row[i] += value;
      targets.col[j] += value;
    }
  }
  return targets;
}

function App() {
  const [gridSize, setGridSize] = useState(7);
  const [grid, setGrid] = useState([]);
  const [targets, setTargets] = useState({ row: [], col: [] });
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    const solutionGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(''));

    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        solutionGrid[i][j] = Math.floor(Math.random() * 10) + 1;
      }
    }
    setTargets(generateTargetValues(solutionGrid));

    const initialUserGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(''));
    setGrid(initialUserGrid);
    setIsSolved(false);
  }, [gridSize]);

  const handleInputChange = (row, col, value) => {
    const newGrid = grid.map((r) => [...r]);
    const parsedValue = parseInt(value, 10);
    newGrid[row][col] = isNaN(parsedValue) ? '' : Math.min(Math.max(parsedValue, 0), 99);
    setGrid(newGrid);

    let solved = true;
    for (let i = 1; i < gridSize - 1; i++) {
      let rowSum = 0;
      let colSum = 0;
      for (let j = 1; j < gridSize - 1; j++) {
        rowSum += Number(newGrid[i][j]) || 0;
        colSum += Number(newGrid[j][i]) || 0;
      }
      if (rowSum !== targets.row[i] || colSum !== targets.col[i]) {
        solved = false;
        break;
      }
    }
    setIsSolved(solved);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>Select grid size: </label>
        <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}>
          <option value={7}>7x7 (Puzzle area: 5x5)</option>
          <option value={6}>6x6 (Puzzle area: 4x4)</option>
          <option value={5}>5x5 (Puzzle area: 3x3)</option>
        </select>
      </div>

      <div
        className="grid-container"
        style={{
          gridTemplateColumns: \`repeat(\${gridSize}, 50px)\`,
          gridTemplateRows: \`repeat(\${gridSize}, 50px)\`
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isTargetCell =
              rowIndex === 0 ||
              rowIndex === gridSize - 1 ||
              colIndex === 0 ||
              colIndex === gridSize - 1;
            return (
              <div
                key={\`\${rowIndex}-\${colIndex}\`}
                className={\`grid-cell \${isTargetCell ? 'target-cell' : ''}\`}
              >
                {isTargetCell ? (
                  <span>
                    {rowIndex === 0 && colIndex > 0 && colIndex < gridSize - 1
                      ? targets.col[colIndex]
                      : ''}
                    {rowIndex === gridSize - 1 && colIndex > 0 && colIndex < gridSize - 1
                      ? targets.col[colIndex]
                      : ''}
                    {colIndex === 0 && rowIndex > 0 && rowIndex < gridSize - 1
                      ? targets.row[rowIndex]
                      : ''}
                    {colIndex === gridSize - 1 && rowIndex > 0 && rowIndex < gridSize - 1
                      ? targets.row[rowIndex]
                      : ''}
                  </span>
                ) : (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={cell}
                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {isSolved && <div className="solved-message">Solved! 🎉</div>}
    </div>
  );
}

export default App;
`;
fs.writeFileSync(path.join('src', 'App.jsx'), appJsx);

console.log('Project setup complete.');
