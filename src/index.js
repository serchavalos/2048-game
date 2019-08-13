import "./main.scss";

import { directions, ERR_END_GAME } from "./constants";
import { getSavedGame, saveGame } from "./events";
import { Grid } from "./grid";

window.onload = () => {
  const scoreElem = document.querySelector(".current-score p");
  const [score, matrix] = getSavedGame();
  const grid = new Grid("game-grid", matrix, score);
  scoreElem.innerText = grid.getScore();

  window.addEventListener("keydown", ({ keyCode }) => {
    const direction = directions[keyCode];
    if (!direction) {
      return;
    }
    grid.moveItems(direction);

    setTimeout(() => {
      try {
        grid.addNewCell();
        scoreElem.innerText = grid.getScore();
        const updatedMatrix = grid.getValues();
        saveGame(grid.getScore(), updatedMatrix);
      } catch (err) {
        if (err.code === ERR_END_GAME) {
          document.querySelector(".modal.game-over").classList.add("visible");
        }
      }
    }, 200);
  });
};
