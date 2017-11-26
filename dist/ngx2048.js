import { ChangeDetectorRef, Component, HostListener, Injectable, Input, NgModule, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';

class GameService {
    constructor() {
        this.defaultConfig = {};
        this.SUPPORTED_THEMES = ['dark', 'colorful'];
        this.STORAGE_NAME = 'app_2048_storage';
        this.gameState = [];
        this.lastMoveDetails = {};
        this.defaultConfig = {
            grid: 4,
            touch: true,
            controls: false,
            keys: true,
            themeControl: true,
            scoreIndicator: true,
            highScore: true,
            rememberState: true,
            theme: 'dark' // current theme
        };
        this.init();
    }
    /**
     * @return {?}
     */
    test() {
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
     * @return {?}
     */
    debug() {
        let /** @type {?} */ s = [];
        s = this.gameState.map(x => {
            return x.join(' | ');
        });
        console.log('----------------------', new Date().getTime());
        let /** @type {?} */ y = 0;
        s.forEach(x => {
            console.log('', y, ' ||', x);
            y++;
        });
        console.log('----------------------');
    }
    /**
     * init the game, check localstorage if config permit
     * otherwise start a fresh game
     * @return {?}
     */
    init() {
        const /** @type {?} */ st = this.getState();
        this.lastMoveDetails = {};
        if (st.gameState && this.defaultConfig && this.defaultConfig.rememberState) {
            this.gameState = st.gameState;
            this.score = st.score || 0;
            this.highScore = st.highScore || 0;
            this.defaultConfig = st.config || this.defaultConfig;
            this.checkDeadlock();
        }
        else {
            this.newGame();
        }
    }
    /**
     * @return {?}
     */
    newGame() {
        this.lastMoveDetails = {};
        this.gameState = [];
        const /** @type {?} */ size = this.defaultConfig.grid;
        for (let /** @type {?} */ i = 0; i < size; i++) {
            let /** @type {?} */ arr = [];
            for (let /** @type {?} */ j = 0; j < size; j++) {
                arr.push(0);
            }
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
     * @return {?}
     */
    setRandomNoPos() {
        let /** @type {?} */ emptyPositions = [];
        for (let /** @type {?} */ i = 0; i < this.gameState.length; i++) {
            for (let /** @type {?} */ j = 0; j < this.gameState[i].length; j++) {
                if (this.gameState[i][j] === 0) {
                    emptyPositions.push({ i: i, j: j });
                }
            }
        }
        if (emptyPositions.length) {
            const /** @type {?} */ randPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            const /** @type {?} */ randNo = Math.random() * 100 > 80 ? 4 : 2;
            this.lastMoveDetails.posAdded = randPos;
            this.lastMoveDetails.posLeft = emptyPositions.length - 1;
            this.gameState[randPos.i][randPos.j] = randNo;
        }
        else {
            this.lastMoveDetails.posLeft = 0;
            return false;
        }
        this.storeGameState(this.gameState);
    }
    /**
     * @return {?}
     */
    getLastMoveDetails() {
        return this.lastMoveDetails;
    }
    /**
     * @param {?} theme
     * @return {?}
     */
    changeTheme(theme) {
        this.defaultConfig.theme = this.SUPPORTED_THEMES.indexOf(theme) >= 0 ? theme : this.defaultConfig.theme;
        this.saveConfig(this.defaultConfig);
    }
    /**
     * change the game state according the action
     * @param {?} direction direction of the operation, [LEFT, RIGHT, UP, DOWN]
     * @return {?}
     */
    changeState(direction) {
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
                let /** @type {?} */ state = this.getCopyState();
                state = this.transpose(state);
                state = this.moveLeft(state);
                this.gameState = this.transpose(state);
                break;
            /**
             * from up to down
             * will stack from bottom, to 0
             */
            case 'DOWN':
                let /** @type {?} */ stater = this.getCopyState();
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
     * @return {?}
     */
    getConfig() {
        return this.defaultConfig;
    }
    /**
     * Get all supported themes
     * @return {?}
     */
    getAllThemes() {
        return this.SUPPORTED_THEMES;
    }
    /**
     * Save the game state, if config permit save to localstorage
     * @param {?} gameState 2d representation of the game
     * @return {?}
     */
    storeGameState(gameState) {
        this.gameState = gameState;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ currentState = this.getState();
            currentState.gameState = gameState;
            this.saveState(currentState);
        }
    }
    /**
     * get game 2d array representation
     * @return {?}
     */
    getGameState() {
        return this.gameState;
    }
    /**
     * get config object
     * @param {?} config game configuration
     * @return {?}
     */
    saveConfig(config) {
        this.mergeConfig(config);
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ st = this.getState();
            st.config = this.defaultConfig;
            this.saveState(st);
        }
    }
    /**
     * get high score
     * @return {?}
     */
    getHighscore() {
        return this.highScore;
    }
    /**
     * save high score, if config permit save in localstorage
     * @param {?} score high score
     * @return {?}
     */
    saveHighScore(score) {
        this.highScore = score;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ st = this.getState();
            st.highScore = score;
            this.saveState(st);
        }
    }
    /**
     * delete high score, set to 0
     * @return {?}
     */
    deleteHighScore() {
        this.highScore = 0;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ st = this.getState();
            st.highScore = 0;
            this.saveState(st);
        }
    }
    /**
     * get current score
     * @return {?}
     */
    getScore() {
        return this.score;
    }
    /**
     * Save score, if config permit save in localstorage
     * @param {?} score current score
     * @return {?}
     */
    saveScore(score) {
        this.score = score;
        if (this.score > this.highScore) {
            this.saveHighScore(this.score);
        }
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ st = this.getState();
            st.score = score;
            this.saveState(st);
        }
    }
    /**
     * delete current score
     * @return {?}
     */
    deleteScore() {
        this.score = 0;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            let /** @type {?} */ st = this.getState();
            st.score = 0;
            this.saveState(st);
        }
    }
    /**
     * Transpose a given array, return a new one
     * @param {?} m an array
     * @return {?}
     */
    transpose(m) {
        // tslint:disable-next-line:no-shadowed-variable
        return m[0].map((x, i) => m.map(x => x[i]));
    }
    /**
     * shallow copy the game state
     * @return {?}
     */
    getCopyState() {
        let /** @type {?} */ arr = [];
        arr = this.gameState.map(x => x.map(y => y));
        return arr;
    }
    /**
     * Move the game array to left
     * @param {?} state the 2d array representation of the game
     * @return {?}
     */
    moveLeft(state) {
        let /** @type {?} */ myState = [];
        state.forEach(x => {
            myState.push(x.map(y => y));
        });
        let /** @type {?} */ noOfMoves = 0;
        let /** @type {?} */ score = this.getScore() || 0;
        for (let /** @type {?} */ i = 0; i < myState.length; i++) {
            /**
             * myState[i] contains each row
             */
            for (let /** @type {?} */ j = 0; j < myState[i].length; j++) {
                let /** @type {?} */ merged = false;
                for (let /** @type {?} */ k = j + 1; k < myState[i].length; k++) {
                    if (merged) {
                        break;
                    }
                    if (myState[i][j] === 0 && myState[i][k] !== 0) {
                        myState[i][j] = myState[i][k];
                        myState[i][k] = 0;
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
                    if (myState[i][j] !== 0 && myState[i][k] !== 0) {
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
     * @return {?}
     */
    checkDeadlock() {
        if (this.lastMoveDetails && this.lastMoveDetails.posLeft) {
            this.lastMoveDetails.deadlock = false;
            return;
        }
        /**
         * check row wise
         */
        let found = false;
        for (let /** @type {?} */ i = 0; i < this.gameState.length; i++) {
            for (let /** @type {?} */ j = 0; j < this.gameState[i].length - 1; j++) {
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
        for (let /** @type {?} */ i = 0; i < this.gameState.length - 1; i++) {
            for (let /** @type {?} */ j = 0; j < this.gameState[i].length; j++) {
                if (this.gameState[i][j] === this.gameState[i + 1][j]) {
                    found = true;
                }
            }
        }
        if (found) {
            this.lastMoveDetails.deadlock = false;
        }
        else {
            this.lastMoveDetails.deadlock = true;
        }
        return;
    }
    /**
     * Move the game array to right
     * @param {?} state the 2d array representation of the game
     * @return {?}
     */
    moveRight(state) {
        let /** @type {?} */ myState = [];
        state.forEach(x => {
            myState.push(x.map(y => y));
        });
        let /** @type {?} */ noOfMoves = 0;
        let /** @type {?} */ score = this.getScore() || 0;
        for (let /** @type {?} */ i = 0; i < myState.length; i++) {
            /**
             * myState[i] contains each row
             */
            for (let /** @type {?} */ j = myState[i].length - 1; j >= 0; j--) {
                let /** @type {?} */ merged = false;
                for (let /** @type {?} */ k = j - 1; k >= 0; k--) {
                    if (merged) {
                        break;
                    }
                    if (myState[i][j] === 0 && myState[i][k] !== 0) {
                        myState[i][j] = myState[i][k];
                        myState[i][k] = 0;
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
                    if (myState[i][j] !== 0 && myState[i][k] !== 0) {
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
     * @param {?} config the config
     * @return {?}
     */
    mergeConfig(config) {
        if (!config) {
            return;
        }
        const /** @type {?} */ keys = Object.keys(config);
        keys.forEach((val) => {
            this.defaultConfig[val] = config[val];
        });
    }
    /**
     * get the current state (total game state including scores)
     * @return {?}
     */
    getState() {
        let /** @type {?} */ currentState = localStorage.getItem(this.STORAGE_NAME);
        if (!currentState) {
            currentState = {};
        }
        else {
            try {
                currentState = JSON.parse(currentState);
            }
            catch (er) { }
        }
        return currentState;
    }
    /**
     * Save the total game state
     * @param {?} state the total game state
     * @return {?}
     */
    saveState(state) {
        localStorage.setItem(this.STORAGE_NAME, JSON.stringify(state));
    }
}
GameService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
GameService.ctorParameters = () => [];

var html2canvas = require("html2canvas");
class GameComponent {
    /**
     * @param {?} gameService
     * @param {?} cdr
     */
    constructor(gameService, cdr) {
        this.gameService = gameService;
        this.cdr = cdr;
        this.SWIPE_ACTION = { LEFT: 'LEFT', RIGHT: 'RIGHT', UP: 'UP', DOWN: 'DOWN' };
        this.gameState = [];
        this.defaultConfig = {};
        this.actionAllowed = false;
        this.lastAction = {};
        this.score = 0;
        this.highScore = 0;
    }
    /**
     * @return {?}
     */
    get config() {
        return this._config;
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set config(val) {
        this._config = val;
        this.gameService.saveConfig(this.config);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    handleKeyboardEvent(event) {
        this.handle_key(event);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this._config) {
            this.gameService.saveConfig(this.config);
        }
        this.gameService.init();
        this.gameState = this.gameService.getGameState();
        this.defaultConfig = this.gameService.getConfig();
        this.actionAllowed = true;
        this.lastAction = this.gameService.getLastMoveDetails();
        this.score = this.gameService.getScore();
        this.highScore = this.gameService.getHighscore();
        this.allThemes = this.gameService.getAllThemes();
        this.cdr.detectChanges();
    }
    /**
     * @return {?}
     */
    newgame() {
        this.gameService.newGame();
        this.gameState = this.gameService.getGameState();
        this.defaultConfig = this.gameService.getConfig();
        this.actionAllowed = true;
        this.lastAction = this.gameService.getLastMoveDetails();
        this.score = this.gameService.getScore();
        this.highScore = this.gameService.getHighscore();
        this.cdr.detectChanges();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    handle_key(event) {
        if (this.defaultConfig.keys) {
            let /** @type {?} */ key = event.key.toLowerCase();
            switch (key) {
                case 'w':
                case 'arrowup':
                    this.swipe(this.SWIPE_ACTION.UP);
                    break;
                case 's':
                case 'arrowdown':
                    this.swipe(this.SWIPE_ACTION.DOWN);
                    break;
                case 'a':
                case 'arrowleft':
                    this.swipe(this.SWIPE_ACTION.LEFT);
                    break;
                case 'd':
                case 'arrowright':
                    this.swipe(this.SWIPE_ACTION.RIGHT);
                    break;
                default:
            }
        }
    }
    /**
     * @return {?}
     */
    change_theme() {
        this.gameService.changeTheme(this.defaultConfig.theme);
        this.defaultConfig = this.gameService.getConfig();
    }
    /**
     * @param {?} action
     * @return {?}
     */
    swipe_a(action) {
        if (this.defaultConfig.touch) {
            this.swipe(action);
        }
    }
    /**
     * @param {?} action
     * @return {?}
     */
    swipe(action) {
        if (!this.actionAllowed) {
            return;
        }
        this.gameService.changeState(action);
        this.gameState = this.gameService.getGameState();
        this.score = this.gameService.getScore();
        this.highScore = this.gameService.getHighscore();
        this.cdr.detectChanges();
        this.addNewNo();
    }
    /**
     * @return {?}
     */
    addNewNo() {
        let /** @type {?} */ lastMove = this.gameService.getLastMoveDetails();
        if (lastMove.moves && lastMove.moves > 0) {
            this.actionAllowed = false;
            setTimeout(() => {
                this.gameService.setRandomNoPos();
                this.actionAllowed = true;
                this.cdr.detectChanges();
            }, 200);
        }
    }
    /**
     * @return {?}
     */
    screenshot() {
        let /** @type {?} */ doc = this.el.nativeElement;
        html2canvas(doc).then(canvas => {
            var /** @type {?} */ myImage = canvas.toDataURL("image/png");
            var /** @type {?} */ link = document.createElement("a");
            link.download = `Image_2024_score_${this.score}.png`;
            link.href = 'data: ' + myImage;
            link.click();
        }).catch(err => {
        });
    }
}
GameComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-game-2048',
                template: `
    <div class="game-container {{defaultConfig ? defaultConfig.theme: ''}}" (swipeleft)="swipe_a(SWIPE_ACTION.LEFT)" (swiperight)="swipe_a(SWIPE_ACTION.RIGHT)" (swipeup)="swipe_a(SWIPE_ACTION.UP)" (swipedown)="swipe_a(SWIPE_ACTION.DOWN)">
      <div class="themecontrol" *ngIf="defaultConfig && defaultConfig.themeControl">
        <form>
          <select name="theme" [(ngModel)]="defaultConfig.theme" (change)="change_theme()">
            <option *ngFor="let opt of allThemes" [value]="opt" [selected]="opt === defaultConfig.theme" style="text-transform: capitalize;">{{opt}}</option>
          </select>
        </form>
      </div>
      <div class="stats" *ngIf="defaultConfig && defaultConfig.scoreIndicator">
        <div class="highscore">
          <span class="txt">High Score</span>
          <span class="score">{{highScore}}</span>
        </div>
        <div class="ngame">
          <button (click)="newgame()">New Game</button>
        </div>
        <div class="currscore">
          <span class="txt">Score</span>
          <span class="score">{{score}}</span>
        </div>
      </div>
      <div class="board-container" #game>
        <div class="board-row" *ngFor="let row of gameState">
          <div class="board-cell {{cell == 0 ? 'zero': 'num'+cell}}" *ngFor="let cell of row">
            <span>{{cell == 0 ? '&nbsp;': cell}}</span>
          </div>
        </div>
        <div class="over" *ngIf="lastAction && lastAction.deadlock">
          <div class="container">
            <div class="text">Game Over</div>
            <div class="btn-cnt">
              <button class="newgame" (click)="newgame()">New Game</button>
            </div>
          </div>
        </div>
      </div>
      <div class="control-container" *ngIf="defaultConfig && defaultConfig.controls">
        <div class="btn-container">
            <div class="g_row">
                <button class="ctl-btn up" (click)="swipe(SWIPE_ACTION.UP)">&uarr;</button>
            </div>
            <div class="g_row">
                <button class="ctl-btn left" (click)="swipe(SWIPE_ACTION.LEFT)">&larr;</button>
                <button class="btn-rnd" (click)="screenshot()">&#9786;</button>
                <button class="ctl-btn right" (click)="swipe(SWIPE_ACTION.RIGHT)">&rarr;</button>
            </div>
            <div class="g_row">
                <button class="ctl-btn down" (click)="swipe(SWIPE_ACTION.DOWN)">&darr;</button>
            </div>
        </div>
      </div>
    </div>
  `,
                styles: [`
    .game-container {
      width: 90%;
      padding: 10px;
      margin: 0 auto; }
      .game-container .board-container {
        position: relative;
        -webkit-animation: MyAnimation 1s;
                animation: MyAnimation 1s;
        width: 100%; }
        .game-container .board-container .board-row {
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex; }
          .game-container .board-container .board-row .board-cell {
            -webkit-box-flex: 1;
                -ms-flex: auto;
                    flex: auto;
            min-width: 50px;
            min-height: 70px;
            background: #96cff5; }
            .game-container .board-container .board-row .board-cell span {
              display: block;
              vertical-align: middle;
              text-align: center;
              margin: 34% 0; }
        .game-container .board-container .over {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(189, 189, 189, 0.59); }
          .game-container .board-container .over .container {
            display: block;
            text-align: center;
            padding-top: 30%; }
            .game-container .board-container .over .container .text {
              font-size: 30px;
              font-weight: 600;
              color: #ffffff;
              text-shadow: 0 0 12px #000; }
            .game-container .board-container .over .container .btn-cnt .newgame {
              padding: 5px;
              margin: 5px;
              font-size: 18px;
              font-weight: 600;
              -webkit-box-shadow: 0 0 12px #525252;
                      box-shadow: 0 0 12px #525252; }
      .game-container .control-container {
        width: 100%;
        text-align: center;
        margin-top: 20px; }
        .game-container .control-container .btn-container {
          max-width: 70%;
          width: auto;
          margin: 0 auto;
          border-radius: 50%;
          background: #f3f3f3; }
          .game-container .control-container .btn-container .g_row {
            display: block;
            width: 100%; }
            .game-container .control-container .btn-container .g_row .ctl-btn {
              background: #4c4c4c;
              /* Old browsers */
              /* FF3.6-15 */
              /* Chrome10-25,Safari5.1-6 */
              background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);
              /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
              filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );
              /* IE6-9 fallback on horizontal gradient */
              outline: none;
              min-width: 50px;
              min-height: 50px;
              cursor: pointer;
              font-weight: 600;
              font-size: 34px; }
              .game-container .control-container .btn-container .g_row .ctl-btn:active {
                outline: none; }
            .game-container .control-container .btn-container .g_row .ctl-btn.up {
              border-top-left-radius: 50%;
              border-top-right-radius: 50%; }
            .game-container .control-container .btn-container .g_row .ctl-btn.down {
              border-bottom-left-radius: 50%;
              border-bottom-right-radius: 50%; }
            .game-container .control-container .btn-container .g_row .ctl-btn.left {
              border-top-left-radius: 50%;
              border-bottom-left-radius: 50%; }
            .game-container .control-container .btn-container .g_row .ctl-btn.right {
              border-top-right-radius: 50%;
              border-bottom-right-radius: 50%; }
            .game-container .control-container .btn-container .g_row .btn-rnd {
              background: #3a3a3a;
              outline: none;
              color: #fff;
              cursor: pointer;
              font-weight: 600;
              font-size: 34px;
              border-radius: 20%; }
      .game-container .stats {
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-shadow: 0 0 5px #000;
                box-shadow: 0 0 5px #000;
        margin: 10px 0;
        padding: 5px 0;
        border-radius: 5px; }
        .game-container .stats .highscore {
          -webkit-box-flex: 1;
              -ms-flex: 1;
                  flex: 1;
          padding: 0 5px; }
          .game-container .stats .highscore .txt {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            color: #000;
            font-weight: 600;
            text-shadow: 0px 0px 2px #e2e2e2; }
          .game-container .stats .highscore .score {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            color: #000;
            font-weight: 600;
            font-size: 20px;
            border-top: 1px double #000;
            margin: 5px 0; }
        .game-container .stats .ngame {
          -webkit-box-flex: 1;
              -ms-flex: 1;
                  flex: 1; }
          .game-container .stats .ngame button {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            width: 100%;
            line-height: 1.4;
            font-size: 17px;
            font-weight: 600; }
        .game-container .stats .currscore {
          -webkit-box-flex: 1;
              -ms-flex: 1;
                  flex: 1;
          text-align: right;
          padding: 0 5px; }
          .game-container .stats .currscore .txt {
            display: block;
            color: #000;
            font-weight: 600;
            text-shadow: 0px 0px 2px #e2e2e2; }
          .game-container .stats .currscore .score {
            display: block;
            color: #000;
            font-weight: 600;
            font-size: 20px;
            border-top: 1px double #000;
            margin: 5px 0; }
      .game-container .themecontrol {
        -webkit-box-shadow: 0 0 10px rgba(136, 134, 134, 0.51);
                box-shadow: 0 0 10px rgba(136, 134, 134, 0.51);
        margin: 5px 0; }
        .game-container .themecontrol select {
          width: 100%;
          height: 35px;
          text-transform: capitalize;
          font-size: 18px; }

    @-webkit-keyframes MyAnimation {
      0% {
        padding-top: 25px; }
      25% {
        padding-top: 30px; }
      50% {
        padding-top: 10px; }
      75% {
        padding-top: 15px; }
      80% {
        padding-top: 5px; }
      90% {
        padding-top: 10px; }
      100% {
        padding-top: 0px; } }

    @keyframes MyAnimation {
      0% {
        padding-top: 25px; }
      25% {
        padding-top: 30px; }
      50% {
        padding-top: 10px; }
      75% {
        padding-top: 15px; }
      80% {
        padding-top: 5px; }
      90% {
        padding-top: 10px; }
      100% {
        padding-top: 0px; } }

    .game-container.dark .board-container {
      background: #7b7b7b;
      -webkit-box-shadow: 0 0 10px #989898;
              box-shadow: 0 0 10px #989898;
      border: 1px solid #333;
      border-style: inset;
      border-radius: 5px; }
      .game-container.dark .board-container .board-row .board-cell {
        background: #fff;
        margin: 2px;
        border-radius: 5px; }
      .game-container.dark .board-container .board-row .board-cell.num2, .game-container.dark .board-container .board-row .board-cell.num256 {
        background: #d0cbcb;
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.dark .board-container .board-row .board-cell.num4, .game-container.dark .board-container .board-row .board-cell.num512 {
        background: #7b7b7b;
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.dark .board-container .board-row .board-cell.num8, .game-container.dark .board-container .board-row .board-cell.num1024 {
        background: #2d2d2d;
        color: #fff;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.dark .board-container .board-row .board-cell.num16, .game-container.dark .board-container .board-row .board-cell.num2048 {
        background: #4c4c4c;
        color: #fff;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000;
        background: #4c4c4c;
        /* Old browsers */
        /* FF3.6-15 */
        /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);
        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );
        /* IE6-9 fallback on horizontal gradient */ }
      .game-container.dark .board-container .board-row .board-cell.num32, .game-container.dark .board-container .board-row .board-cell.num4096 {
        background: #171717;
        color: #fff;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.dark .board-container .board-row .board-cell.num64 {
        background: #000000;
        color: #fff;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.dark .board-container .board-row .board-cell.num128 {
        /* FF3.6-15 */
        /* Chrome10-25,Safari5.1-6 */
        background: -webkit-gradient(linear, left top, right top, color-stop(44%, rgba(0, 0, 0, 0.65)), color-stop(63%, rgba(0, 0, 0, 0.36)), color-stop(87%, transparent), to(transparent));
        background: linear-gradient(to right, rgba(0, 0, 0, 0.65) 44%, rgba(0, 0, 0, 0.36) 63%, transparent 87%, transparent 100%);
        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#a6000000', endColorstr='#00000000',GradientType=1 );
        /* IE6-9 */
        color: #fff; }

    .game-container.dark .control-container .btn-container .g_row .ctl-btn {
      color: #fff;
      background: #4c4c4c;
      /* Old browsers */
      /* FF3.6-15 */
      /* Chrome10-25,Safari5.1-6 */
      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);
      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );
      /* IE6-9 fallback on horizontal gradient */ }

    .game-container.dark .control-container .btn-container .g_row .btn-rnd {
      background: #4c4c4c;
      /* Old browsers */
      /* FF3.6-15 */
      /* Chrome10-25,Safari5.1-6 */
      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);
      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );
      /* IE6-9 fallback on horizontal gradient */
      color: #fff; }

    .game-container.dark .stats {
      background: #4c4c4c;
      /* Old browsers */
      /* FF3.6-15 */
      /* Chrome10-25,Safari5.1-6 */
      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);
      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );
      /* IE6-9 fallback on horizontal gradient */ }
      .game-container.dark .stats .highscore .txt {
        color: #fff;
        text-shadow: none; }
      .game-container.dark .stats .highscore .score {
        color: #fff;
        border-top: 1px double #fff; }
      .game-container.dark .stats .currscore .txt {
        color: #fff;
        text-shadow: none; }
      .game-container.dark .stats .currscore .score {
        color: #fff;
        border-top: 1px double #fff; }

    .game-container.colorful .board-container {
      background-color: #a8e9ff;
      filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#a8e9ff, endColorstr=#4a3ef0);
      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(5%, #a8e9ff), color-stop(25%, #4a3ef0), color-stop(52%, #3ef053), color-stop(80%, #ff8d00), to(#f7f734));
      background-image: linear-gradient(right bottom, #a8e9ff 5%, #4a3ef0 25%, #3ef053 52%, #ff8d00 80%, #f7f734 100%);
      background-image: -ms-linear-gradient(right bottom, #a8e9ff 5%, #4a3ef0 25%, #3ef053 52%, #ff8d00 80%, #f7f734 100%);
      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(5%, #a8e9ff), color-stop(25%, #4a3ef0), color-stop(52%, #3ef053), color-stop(80%, #ff8d00), color-stop(100%, #f7f734));
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e0f3fa', endColorstr='#b6dffd',GradientType=1 );
      /* IE6-9 fallback on horizontal gradient */
      -webkit-box-shadow: 0 0 10px rgba(2, 97, 97, 0.78);
              box-shadow: 0 0 10px rgba(2, 97, 97, 0.78);
      border: 1px solid #7977fb;
      border-style: inset;
      border-radius: 5px; }
      .game-container.colorful .board-container .board-row .board-cell {
        background-color: #ffffff;
        margin: 2px;
        border-radius: 5px; }
      .game-container.colorful .board-container .board-row .board-cell.num2, .game-container.colorful .board-container .board-row .board-cell.num256 {
        background-color: #2ef245;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#2ef245, endColorstr=#cbff70);
        background-image: -webkit-gradient(linear, left bottom, right top, from(#2ef245), to(#cbff70));
        background-image: linear-gradient(left bottom, #2ef245 0%, #cbff70 100%);
        background-image: -o-linear-gradient(left bottom, #2ef245 0%, #cbff70 100%);
        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(0%, #2ef245), color-stop(100%, #cbff70));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #fff;
                box-shadow: 0 0 2px #fff; }
      .game-container.colorful .board-container .board-row .board-cell.num4, .game-container.colorful .board-container .board-row .board-cell.num512 {
        background-color: #4b2ef2;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#4b2ef2, endColorstr=#5bc4f5);
        background-image: -webkit-gradient(linear, left bottom, right top, from(#4b2ef2), to(#5bc4f5));
        background-image: linear-gradient(left bottom, #4b2ef2 0%, #5bc4f5 100%);
        background-image: -o-linear-gradient(left bottom, #4b2ef2 0%, #5bc4f5 100%);
        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(0%, #4b2ef2), color-stop(100%, #5bc4f5));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #fff;
                box-shadow: 0 0 2px #fff; }
      .game-container.colorful .board-container .board-row .board-cell.num8, .game-container.colorful .board-container .board-row .board-cell.num1024 {
        background-color: #f0b222;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#f0b222, endColorstr=#4251f5);
        background-image: linear-gradient(right bottom, #f0b222 21%, #4251f5 81%);
        background-image: -o-linear-gradient(right bottom, #f0b222 21%, #4251f5 81%);
        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(21%, #f0b222), color-stop(81%, #4251f5));
        color: #fff;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #fff;
                box-shadow: 0 0 2px #fff; }
      .game-container.colorful .board-container .board-row .board-cell.num16, .game-container.colorful .board-container .board-row .board-cell.num2048 {
        background-color: #fc8d77;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#fc8d77, endColorstr=#a673ff);
        background-image: -webkit-gradient(linear, right bottom, left top, from(#fc8d77), color-stop(81%, #a673ff));
        background-image: linear-gradient(right bottom, #fc8d77 0%, #a673ff 81%);
        background-image: -o-linear-gradient(right bottom, #fc8d77 0%, #a673ff 81%);
        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #fc8d77), color-stop(81%, #a673ff));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.colorful .board-container .board-row .board-cell.num32, .game-container.colorful .board-container .board-row .board-cell.num4096 {
        background-color: #ffff29;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#ffff29, endColorstr=#ff73ce);
        background-image: -webkit-gradient(linear, right bottom, left top, from(#ffff29), color-stop(81%, #ff73ce));
        background-image: linear-gradient(right bottom, #ffff29 0%, #ff73ce 81%);
        background-image: -o-linear-gradient(right bottom, #ffff29 0%, #ff73ce 81%);
        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #ffff29), color-stop(81%, #ff73ce));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.colorful .board-container .board-row .board-cell.num64 {
        background-color: #a2a8eb;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#a2a8eb, endColorstr=#b5b5b5);
        background-image: -webkit-gradient(linear, right bottom, left top, from(#a2a8eb), color-stop(81%, #b5b5b5));
        background-image: linear-gradient(right bottom, #a2a8eb 0%, #b5b5b5 81%);
        background-image: -o-linear-gradient(right bottom, #a2a8eb 0%, #b5b5b5 81%);
        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #a2a8eb), color-stop(81%, #b5b5b5));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }
      .game-container.colorful .board-container .board-row .board-cell.num128 {
        background-color: #3d8ef2;
        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#3d8ef2, endColorstr=#68cf5d);
        background-image: linear-gradient(left bottom, #3d8ef2 11%, #68cf5d 51%, #f0b52e 86%);
        background-image: -ms-linear-gradient(left bottom, #3d8ef2 11%, #68cf5d 51%, #f0b52e 86%);
        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(11%, #3d8ef2), color-stop(51%, #68cf5d), color-stop(86%, #f0b52e));
        color: #000;
        font-size: initial;
        font-weight: 600;
        -webkit-box-shadow: 0 0 2px #000;
                box-shadow: 0 0 2px #000; }

    .game-container.colorful .control-container .btn-container {
      background-color: #80d7ff;
      filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#80d7ff, endColorstr=#53f55b);
      background-image: -webkit-gradient(linear, right bottom, left top, from(#80d7ff), color-stop(31%, #53f55b), color-stop(53%, #628ef5), color-stop(79%, #ccb221), to(#ff7070));
      background-image: linear-gradient(right bottom, #80d7ff 0%, #53f55b 31%, #628ef5 53%, #ccb221 79%, #ff7070 100%);
      background-image: -ms-linear-gradient(right bottom, #80d7ff 0%, #53f55b 31%, #628ef5 53%, #ccb221 79%, #ff7070 100%);
      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #80d7ff), color-stop(31%, #53f55b), color-stop(53%, #628ef5), color-stop(79%, #ccb221), color-stop(100%, #ff7070)); }
      .game-container.colorful .control-container .btn-container .g_row .ctl-btn {
        color: #000;
        background: #b7deed;
        /* Old browsers */
        /* FF3.6-15 */
        /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(135deg, #b7deed 0%, #71ceef 50%, #21b4e2 51%, #b7deed 100%);
        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7deed', endColorstr='#b7deed',GradientType=1 );
        /* IE6-9 fallback on horizontal gradient */ }
      .game-container.colorful .control-container .btn-container .g_row .btn-rnd {
        background: #b7deed;
        /* Old browsers */
        /* FF3.6-15 */
        /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(135deg, #b7deed 0%, #71ceef 50%, #21b4e2 51%, #b7deed 100%);
        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7deed', endColorstr='#b7deed',GradientType=1 );
        /* IE6-9 fallback on horizontal gradient */
        color: #000; }

    .game-container.colorful .stats {
      background: #ffb76b;
      /* Old browsers */
      /* FF3.6-15 */
      /* Chrome10-25,Safari5.1-6 */
      background: linear-gradient(135deg, #ffb76b 0%, #ffa73d 50%, #ff7c00 51%, #ff7f04 100%);
      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffb76b', endColorstr='#ff7f04',GradientType=1 );
      /* IE6-9 fallback on horizontal gradient */ }
      .game-container.colorful .stats .highscore .txt {
        color: #000;
        text-shadow: none; }
      .game-container.colorful .stats .highscore .score {
        color: #000;
        border-top: 1px double #000; }
      .game-container.colorful .stats .currscore .txt {
        color: #000;
        text-shadow: none; }
      .game-container.colorful .stats .currscore .score {
        color: #000;
        border-top: 1px double #000; }
  `],
                providers: [GameService]
            },] },
];
/**
 * @nocollapse
 */
GameComponent.ctorParameters = () => [
    { type: GameService, },
    { type: ChangeDetectorRef, },
];
GameComponent.propDecorators = {
    'el': [{ type: ViewChild, args: ['game',] },],
    'config': [{ type: Input },],
    'handleKeyboardEvent': [{ type: HostListener, args: ['document:keyup', ['$event'],] },],
};

class MyHammerConfig extends HammerGestureConfig {
    constructor() {
        super(...arguments);
        this.overrides = ({
            'swipe': { velocity: 0.4, threshold: 20, direction: 31 } // override default settings
        });
    }
}
class Ng2048Module {
}
Ng2048Module.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule,
                ],
                declarations: [GameComponent],
                providers: [{
                        provide: HAMMER_GESTURE_CONFIG,
                        useClass: MyHammerConfig
                    }],
                exports: [GameComponent]
            },] },
];
/**
 * @nocollapse
 */
Ng2048Module.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { Ng2048Module, GameService, GameComponent, MyHammerConfig as ɵa };
//# sourceMappingURL=ngx2048.js.map
