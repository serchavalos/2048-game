import { ERR_END_GAME } from "./constants";

export class EndGameError extends Error {
  constructor() {
    super();
    this.code = ERR_END_GAME;
  }
}
