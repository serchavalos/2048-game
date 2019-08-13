import { LIMIT, DOWN, UP, LEFT, RIGHT } from "./constants";
import { getRandom } from "./events";
import { EndGameError } from "./end-game-error";

export class Grid {
  constructor(elementID, matrix, score = 0) {
    this.domElem = document.getElementById(elementID);
    if (!this.domElem) {
      throw new Error("Not found");
    }
    this.score = score;
    this.items = this.generateMatrixItems(matrix);
    const fragment = this.createMatrixFragment(this.items);
    this.domElem.appendChild(fragment);
  }

  generateMatrixItems(matrix) {
    const items = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    matrix.forEach((rows, row) => {
      rows.forEach((value, col) => {
        if (!value) {
          return;
        }

        const cell = document.createElement("div");
        cell.className = `item item-${value} position_${col}_${row}`;

        const innerText = document.createElement("div");
        innerText.innerText = value;
        innerText.className = "inner-text";
        cell.appendChild(innerText);
        items[row][col] = cell;
      });
    });
    return items;
  }

  createMatrixFragment(items) {
    const fragment = document.createDocumentFragment();
    items.map(row =>
      row.filter(item => item).map(item => fragment.appendChild(item))
    );
    return fragment;
  }

  getValues() {
    return this.items.map(rows =>
      rows.map(item => (item ? item.firstElementChild.innerText : null))
    );
  }

  _moveVertically(direction, cell, row, nextRow, col) {
    const operand = direction === UP ? +1 : -1;
    const nextCell = this.items[nextRow][col];
    if (nextCell === null) {
      this.items[nextRow][col] = cell;
      this.items[row][col] = null;
      const value = cell.firstElementChild.innerText;
      cell.className = `item item-${value} position_${col}_${nextRow}`;
    } else if (
      !nextCell.classList.contains("merged") &&
      nextCell.firstElementChild.innerText === cell.firstElementChild.innerText
    ) {
      this.domElem.removeChild(nextCell);
      this.items[nextRow][col] = cell;
      this.items[row][col] = null;
      const value = parseInt(cell.firstElementChild.innerText);
      const newValue = value * 2;
      cell.firstElementChild.innerText = newValue;
      cell.className = `item item-${newValue} position_${col}_${nextRow} merged`;
    } else if (nextRow + operand !== row) {
      nextRow = nextRow + operand;
      this.items[nextRow][col] = cell;
      this.items[row][col] = null;
      const value = cell.firstElementChild.innerText;
      cell.className = `item item-${value} position_${col}_${nextRow}`;
    }
  }

  _moveHorizontally(direction, cell, row, nextCol, col) {
    const operand = direction === LEFT ? +1 : -1;
    const nextCell = this.items[row][nextCol];
    if (nextCell === null) {
      this.items[row][nextCol] = cell;
      this.items[row][col] = null;
      const value = cell.firstElementChild.innerText;
      cell.className = `item item-${value} position_${nextCol}_${row}`;
    } else if (
      !nextCell.classList.contains("merged") &&
      nextCell.firstElementChild.innerText === cell.firstElementChild.innerText
    ) {
      this.domElem.removeChild(nextCell);
      this.items[row][nextCol] = cell;
      this.items[row][col] = null;
      const value = parseInt(cell.firstElementChild.innerText);
      const newValue = value * 2;
      cell.firstElementChild.innerText = newValue;
      cell.className = `item item-${newValue} position_${nextCol}_${row} merged`;
    } else if (nextCol + operand !== col) {
      nextCol = nextCol + operand;
      this.items[row][nextCol] = cell;
      this.items[row][col] = null;
      const value = cell.firstElementChild.innerText;
      cell.className = `item item-${value} position_${nextCol}_${row}`;
    }
  }

  moveItems(direction) {
    Array.from(this.domElem.querySelectorAll(".merged")).map(child =>
      child.classList.remove("merged")
    );
    if (direction === DOWN) {
      for (let row = 2; row >= 0; row--) {
        for (let col = 0; col < LIMIT; col++) {
          const cell = this.items[row][col];
          if (!cell) {
            continue;
          }
          let nextRow = row;
          while (true) {
            if (!this.items[nextRow + 1]) {
              break;
            }
            nextRow += 1;
            if (this.items[nextRow][col] !== null) {
              break;
            }
          }
          this._moveVertically(direction, cell, row, nextRow, col);
        }
      }
    } else if (direction === UP) {
      for (let row = 1; row < LIMIT; row++) {
        for (let col = 0; col < LIMIT; col++) {
          const cell = this.items[row][col];
          if (!cell) {
            continue;
          }
          let nextRow = row;
          while (true) {
            if (!this.items[nextRow - 1]) {
              break;
            }
            nextRow -= 1;
            if (this.items[nextRow][col] !== null) {
              break;
            }
          }
          this._moveVertically(direction, cell, row, nextRow, col);
        }
      }
    } else if (direction === RIGHT) {
      for (let col = 2; col >= 0; col--) {
        for (let row = 0; row < LIMIT; row++) {
          const cell = this.items[row][col];
          if (!cell) {
            continue;
          }
          let nextCol = col;
          while (true) {
            if (typeof this.items[row][nextCol + 1] === "undefined") {
              break;
            }
            nextCol += 1;
            if (this.items[row][nextCol] !== null) {
              break;
            }
          }
          this._moveHorizontally(direction, cell, row, nextCol, col);
        }
      }
    } else if (direction === LEFT) {
      for (let col = 1; col < LIMIT; col++) {
        for (let row = 0; row < LIMIT; row++) {
          const cell = this.items[row][col];
          if (!cell) {
            continue;
          }
          let nextCol = col;
          while (true) {
            if (typeof this.items[row][nextCol - 1] === "undefined") {
              break;
            }
            nextCol -= 1;
            if (this.items[row][nextCol] !== null) {
              break;
            }
          }
          this._moveHorizontally(direction, cell, row, nextCol, col);
        }
      }
    }
    this.score = Array.from(this.domElem.querySelectorAll(".merged")).reduce(
      (score, child) => (score += parseInt(child.firstElementChild.innerText)),
      this.score
    );
  }

  addNewCell() {
    const emptyCells = this.items.reduce(
      (acc, rows, row) =>
        rows.reduce(
          (values, value, col) => (!value ? [...values, [row, col]] : values),
          acc
        ),
      []
    );
    if (!emptyCells.length) {
      throw new EndGameError("matrix is full");
    }
    const randIndex = getRandom(emptyCells.length);
    const [row, col] = emptyCells[randIndex];

    const cell = document.createElement("div");
    cell.className = `item item-${1} position_${col}_${row}`;

    const innerText = document.createElement("div");
    innerText.innerText = "1";
    innerText.className = "inner-text";
    cell.appendChild(innerText);

    this.domElem.appendChild(cell);
    this.items[row][col] = cell;
  }

  getScore() {
    return this.score;
  }
}
