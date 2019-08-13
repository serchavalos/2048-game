import { LIMIT, LS_MATRIX_KEY, LS_SCORE_KEY } from "./constants";

const generateNewMatrix = () => {
  const row = getRandom(LIMIT);
  const col = getRandom(LIMIT);
  const matrix = Array(4).fill([null, null, null, null]);
  matrix[row][col] = 1;
  return matrix;
};

export const getSavedGame = () => {
  const savedMatrix = localStorage.getItem(LS_MATRIX_KEY);
  const score = localStorage.getItem(LS_SCORE_KEY);
  let matrix;
  try {
    matrix = JSON.parse(savedMatrix);
  } catch (_) {
    matrix = null;
  }
  if (!matrix) {
    matrix = generateNewMatrix();
  }

  return [parseInt(score || "0"), matrix];
};

export const saveGame = (score, matrix) => {
  localStorage.setItem(LS_MATRIX_KEY, JSON.stringify(matrix));
  localStorage.setItem(LS_SCORE_KEY, score);
};

export const getRandom = limit => {
  return Math.floor(Math.random() * Math.floor(limit));
};
