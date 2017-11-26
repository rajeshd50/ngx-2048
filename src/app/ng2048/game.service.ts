import { Injectable } from '@angular/core';

@Injectable()
export class GameService {

  private defaultConfig:any = {};

  private SUPPORTED_THEMES: string[] = ['dark', 'colorful' ];

  private STORAGE_NAME = 'app_2048_storage';

  private highScore: number;

  private gameState = [];

  private score: number;

  private lastMoveDetails: any = {};

  constructor() { 
    this.defaultConfig = {
      grid: 4, // no of grid to show
      touch: true, // touch support
      controls: false, // manual button control
      keys: true, // arrow keys support
      themeControl: true, // change theme drop-down
      scoreIndicator: true, // show current score
      highScore: true, // remember high score
      rememberState: true, // use local storage for state presistense
      theme: 'dark' // current theme
    };
    this.init();
  }

  public test() {
    // this.init();
    // console.log('after init');
    // this.debug();
    // this.changeState('LEFT');
    // console.log('after left');
    // this.debug();
    // this.setRandomNoPos();
    // console.log('after new elem');
    // this.debug();
    // this.changeState('LEFT');
    // console.log('after left again');
    // this.debug();
    // this.setRandomNoPos();
    // console.log('after new elem again');
    // this.debug();
  }

  /**
   * for print debug display
   */
  public debug() {
    let s = [];
    s = this.gameState.map(x => {
      return x.join(' | ');
    });
    console.log('----------------------', new Date().getTime());
    let y = 0;
    s.forEach(x => {
      console.log('', y , ' ||', x);
      y++;
    });
    console.log('----------------------');
  }

  /**
   * init the game, check localstorage if config permit
   * otherwise start a fresh game
   */
  public init() {
    const st = this.getState();
    this.lastMoveDetails = {};
    if (st.gameState && this.defaultConfig && this.defaultConfig.rememberState) {
      this.gameState = st.gameState;
      this.score = st.score || 0;
      this.highScore = st.highScore || 0;
      this.defaultConfig = st.config || this.defaultConfig;
      this.checkDeadlock();
    } else {
      this.newGame();
    }
  }

  public newGame() {
    this.lastMoveDetails = {};
    this.gameState = [];
    const size = this.defaultConfig.grid;
    for (let i = 0; i < size; i++) {
      let arr = [];
      for (let j = 0; j < size; j++ ) { arr.push(0); }
      this.gameState.push(arr);
    }
    this.highScore = this.highScore == undefined ? 0 : this.highScore;
    this.score = 0;
    this.setRandomNoPos();
    this.setRandomNoPos();
    this.storeGameState(this.gameState);
    // this.saveHighScore(this.highScore);
    this.saveScore(this.score);
  }

  /**
   * Set a random position in the state with a random number,
   * return true if success, false otherwise. If false no such empty 
   * block available, that means game ends.
   */
  public setRandomNoPos() {
    let emptyPositions = [];
    for (let i = 0; i < this.gameState.length; i++) {
      for (let j = 0; j < this.gameState[i].length; j++) {
        if (this.gameState[i][j] === 0) {
          emptyPositions.push({i: i, j: j});
        }
      }
    }
    if (emptyPositions.length) {
      const randPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      const randNo = Math.random() * 100 > 80 ? 4 : 2;
      this.lastMoveDetails.posAdded = randPos;
      this.lastMoveDetails.posLeft = emptyPositions.length - 1;
      this.gameState[randPos.i][randPos.j] = randNo;
    } else {
      this.lastMoveDetails.posLeft = 0;
      return false;
    }
    this.storeGameState(this.gameState);
  }

  public getLastMoveDetails() {
    return this.lastMoveDetails;
  }

  public changeTheme(theme: string) {
    this.defaultConfig.theme = this.SUPPORTED_THEMES.indexOf(theme) >= 0 ? theme: this.defaultConfig.theme;
    this.saveConfig(this.defaultConfig);
  }

  /**
   * change the game state according the action
   * @param direction direction of the operation, [LEFT, RIGHT, UP, DOWN]
   */
  public changeState(direction) {
    switch (direction) {
      /**
       * from right to left
       * will stack from 0, to last
       */
      case 'LEFT':
        this.gameState = this.moveLeft(this.gameState);
        break;
      /**
       * from left to right
       * will stack from last, to 0
       */
      case 'RIGHT':
      this.gameState = this.moveRight(this.gameState);
        break;
      /**
       * from down to up
       * will stack from 0, to bottom
       */
      case 'UP':
        let state = this.getCopyState();
        state = this.transpose(state);
        state = this.moveLeft(state);
        this.gameState = this.transpose(state);
        break;
      /**
       * from up to down
       * will stack from bottom, to 0
       */
      case 'DOWN':
        let stater = this.getCopyState();
        stater = this.transpose(stater);
        stater = this.moveRight(stater);
        this.gameState = this.transpose(stater);
        break;
    }
    this.storeGameState(this.gameState);
    this.checkDeadlock();
  }

  /**
   * Get current config
   */
  public getConfig() {
    return this.defaultConfig;
  }

  /**
   * Get all supported themes
   */
  public getAllThemes() {
    return this.SUPPORTED_THEMES;
  }

  /**
   * Save the game state, if config permit save to localstorage
   * @param gameState 2d representation of the game
   */
  public storeGameState(gameState: any) {
    this.gameState = gameState;
    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let currentState = this.getState();
      currentState.gameState = gameState;
      this.saveState(currentState);
    }
  }

  /**
   * get game 2d array representation
   */
  public getGameState() {
    return this.gameState;
  }

  /**
   * get config object
   * @param config game configuration
   */
  public saveConfig(config) {
    this.mergeConfig(config);

    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let st = this.getState();
      st.config = this.defaultConfig;
      this.saveState(st);
    }
  }

  /**
   * get high score
   */
  public getHighscore() {
    return this.highScore;
  }

  /**
   * save high score, if config permit save in localstorage
   * @param score high score
   */
  public saveHighScore(score: number) {
    this.highScore = score;
    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let st = this.getState();
      st.highScore = score;
      this.saveState(st);
    }
  }

  /**
   * delete high score, set to 0
   */
  public deleteHighScore() {
    this.highScore = 0;
    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let st = this.getState();
      st.highScore = 0;
      this.saveState(st);
    }
  }

  /**
   * get current score
   */
  public getScore() {
    return this.score;
  }

  /**
   * Save score, if config permit save in localstorage
   * @param score current score
   */
  public saveScore(score: number) {
    this.score = score;

    if(this.score > this.highScore) {
      this.saveHighScore(this.score);
    }

    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let st = this.getState();
      st.score = score;
      this.saveState(st);
    }
  }

  /**
   * delete current score
   */
  public deleteScore() {
    this.score = 0;
    if (this.defaultConfig && this.defaultConfig.rememberState) {
      // tslint:disable-next-line:prefer-const
      let st = this.getState();
      st.score = 0;
      this.saveState(st);
    }
  }

  /**
   * Transpose a given array, return a new one
   * @param m an array
   */
  private transpose(m) {
    // tslint:disable-next-line:no-shadowed-variable
    return m[0].map((x, i) => m.map(x => x[i]));
  }

  /**
   * shallow copy the game state
   */
  private getCopyState() {
    let arr = [];

    arr = this.gameState.map(x => x.map(y => y));

    return arr;
  }

  /**
   * Move the game array to left
   * @param state the 2d array representation of the game
   */
  private moveLeft(state) {
    let myState = [];
    state.forEach(x => {
      myState.push(x.map(y => y));
    })
    let noOfMoves = 0;
    let score = this.getScore() || 0;
    for (let i = 0; i < myState.length; i++) {
      /**
       * myState[i] contains each row
       */
      for (let j = 0; j < myState[i].length; j++) {
        let merged = false;
        let pulled = false;
        for (let k = j + 1; k < myState[i].length; k++) {
          if (merged) { break; }
          if (myState[i][j] === 0 && myState[i][k] !== 0) {
            myState[i][j] = myState[i][k];
            myState[i][k] = 0;
            pulled = true;
            noOfMoves++;
            continue;
          }
          if (myState[i][j] === myState[i][k] && myState[i][k] !== 0) {
            myState[i][j] *= 2;
            myState[i][k] = 0;
            score += myState[i][j];
            merged = true;
            noOfMoves++;
            continue;
          }
          if (myState[i][j] !== 0 && myState[i][k] !==0) {
            break;
          }
        }
      }
    }
    this.saveScore(score);
    this.lastMoveDetails.moves = noOfMoves;
    return myState;
  }

  private checkDeadlock() {
    if (this.lastMoveDetails && this.lastMoveDetails.posLeft) {
      this.lastMoveDetails.deadlock = false;
      return;
    }
    /**
     * check row wise
     */
    let found = false;
    for (let i = 0; i < this.gameState.length; i++) {
      for (let j = 0; j < this.gameState[i].length - 1; j++) {
        if (this.gameState[i][j] === this.gameState[i][j + 1]) {
          found = true;
        }
      }
    }
    if (found) {
      this.lastMoveDetails.deadlock = false;
      return;
    }

    /**
     * check column wise
     */
    for (let i = 0; i < this.gameState.length - 1; i++) {
      for (let j = 0; j < this.gameState[i].length; j++) {
        if (this.gameState[i][j] === this.gameState[i + 1][j]) {
          found = true;
        }
      }
    }
    if (found) {
      this.lastMoveDetails.deadlock = false;
    } else {
      this.lastMoveDetails.deadlock = true;
    }
    return;
  }

  /**
   * Move the game array to right
   * @param state the 2d array representation of the game
   */
  private moveRight(state) {
    let myState = [];
    state.forEach(x => {
      myState.push(x.map(y => y));
    })
    let noOfMoves = 0;
    let score = this.getScore() || 0;
    for (let i = 0; i < myState.length; i++) {
      /**
       * myState[i] contains each row
       */
      for (let j = myState[i].length - 1; j >= 0; j--) {
        let merged = false;
        let pulled = false;
        for (let k = j - 1; k >= 0; k--) {
          if (merged) { break; }
          if (myState[i][j] === 0 && myState[i][k] !== 0) {
            myState[i][j] = myState[i][k];
            myState[i][k] = 0;
            pulled = true;
            noOfMoves++;
            continue;
          }
          if (myState[i][j] === myState[i][k] && myState[i][k] !== 0) {
            myState[i][j] *= 2;
            myState[i][k] = 0;
            merged = true;
            noOfMoves++;
            score += myState[i][j];
            continue;
          }
          if (myState[i][j] !== 0 && myState[i][k] !==0) {
            break;
          }
        }
      }
    }
    this.saveScore(score);
    this.lastMoveDetails.moves = noOfMoves;
    return myState;
  }

  /**
   * Merge config with default one
   * @param config the config
   */
  private mergeConfig(config) {
    if (!config) { return; }
    const keys = Object.keys(config);
    keys.forEach((val) => {
      this.defaultConfig[val] = config[val];
    });
  }

  /**
   * get the current state (total game state including scores)
   */
  private getState() {
    let currentState: any = localStorage.getItem(this.STORAGE_NAME);
    if (!currentState) {
      currentState = {};
    } else {
      try {
        currentState  = JSON.parse(currentState);
      } catch (er) {}
    }
    return currentState;
  }

  /**
   * Save the total game state
   * @param state the total game state
   */
  private saveState(state: any) {
    localStorage.setItem(this.STORAGE_NAME, JSON.stringify(state));
  }
}
