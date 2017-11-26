(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/forms'), require('@angular/platform-browser')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', '@angular/forms', '@angular/platform-browser'], factory) :
	(factory((global.ngx2048 = {}),global.ng.core,global.ng.common,global.ng.forms,global.ng.platformBrowser));
}(this, (function (exports,core,common,forms,platformBrowser) { 'use strict';

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GameService = (function () {
    function GameService() {
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
    GameService.prototype.test = function () {
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
    };
    /**
     * for print debug display
     * @return {?}
     */
    GameService.prototype.debug = function () {
        var /** @type {?} */ s = [];
        s = this.gameState.map(function (x) {
            return x.join(' | ');
        });
        console.log('----------------------', new Date().getTime());
        var /** @type {?} */ y = 0;
        s.forEach(function (x) {
            console.log('', y, ' ||', x);
            y++;
        });
        console.log('----------------------');
    };
    /**
     * init the game, check localstorage if config permit
     * otherwise start a fresh game
     * @return {?}
     */
    GameService.prototype.init = function () {
        var /** @type {?} */ st = this.getState();
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
    };
    /**
     * @return {?}
     */
    GameService.prototype.newGame = function () {
        this.lastMoveDetails = {};
        this.gameState = [];
        var /** @type {?} */ size = this.defaultConfig.grid;
        for (var /** @type {?} */ i = 0; i < size; i++) {
            var /** @type {?} */ arr = [];
            for (var /** @type {?} */ j = 0; j < size; j++) {
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
    };
    /**
     * Set a random position in the state with a random number,
     * return true if success, false otherwise. If false no such empty
     * block available, that means game ends.
     * @return {?}
     */
    GameService.prototype.setRandomNoPos = function () {
        var /** @type {?} */ emptyPositions = [];
        for (var /** @type {?} */ i = 0; i < this.gameState.length; i++) {
            for (var /** @type {?} */ j = 0; j < this.gameState[i].length; j++) {
                if (this.gameState[i][j] === 0) {
                    emptyPositions.push({ i: i, j: j });
                }
            }
        }
        if (emptyPositions.length) {
            var /** @type {?} */ randPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            var /** @type {?} */ randNo = Math.random() * 100 > 80 ? 4 : 2;
            this.lastMoveDetails.posAdded = randPos;
            this.lastMoveDetails.posLeft = emptyPositions.length - 1;
            this.gameState[randPos.i][randPos.j] = randNo;
        }
        else {
            this.lastMoveDetails.posLeft = 0;
            return false;
        }
        this.storeGameState(this.gameState);
    };
    /**
     * @return {?}
     */
    GameService.prototype.getLastMoveDetails = function () {
        return this.lastMoveDetails;
    };
    /**
     * @param {?} theme
     * @return {?}
     */
    GameService.prototype.changeTheme = function (theme) {
        this.defaultConfig.theme = this.SUPPORTED_THEMES.indexOf(theme) >= 0 ? theme : this.defaultConfig.theme;
        this.saveConfig(this.defaultConfig);
    };
    /**
     * change the game state according the action
     * @param {?} direction direction of the operation, [LEFT, RIGHT, UP, DOWN]
     * @return {?}
     */
    GameService.prototype.changeState = function (direction) {
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
                var /** @type {?} */ state = this.getCopyState();
                state = this.transpose(state);
                state = this.moveLeft(state);
                this.gameState = this.transpose(state);
                break;
            /**
             * from up to down
             * will stack from bottom, to 0
             */
            case 'DOWN':
                var /** @type {?} */ stater = this.getCopyState();
                stater = this.transpose(stater);
                stater = this.moveRight(stater);
                this.gameState = this.transpose(stater);
                break;
        }
        this.storeGameState(this.gameState);
        this.checkDeadlock();
    };
    /**
     * Get current config
     * @return {?}
     */
    GameService.prototype.getConfig = function () {
        return this.defaultConfig;
    };
    /**
     * Get all supported themes
     * @return {?}
     */
    GameService.prototype.getAllThemes = function () {
        return this.SUPPORTED_THEMES;
    };
    /**
     * Save the game state, if config permit save to localstorage
     * @param {?} gameState 2d representation of the game
     * @return {?}
     */
    GameService.prototype.storeGameState = function (gameState) {
        this.gameState = gameState;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ currentState = this.getState();
            currentState.gameState = gameState;
            this.saveState(currentState);
        }
    };
    /**
     * get game 2d array representation
     * @return {?}
     */
    GameService.prototype.getGameState = function () {
        return this.gameState;
    };
    /**
     * get config object
     * @param {?} config game configuration
     * @return {?}
     */
    GameService.prototype.saveConfig = function (config) {
        this.mergeConfig(config);
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ st = this.getState();
            st.config = this.defaultConfig;
            this.saveState(st);
        }
    };
    /**
     * get high score
     * @return {?}
     */
    GameService.prototype.getHighscore = function () {
        return this.highScore;
    };
    /**
     * save high score, if config permit save in localstorage
     * @param {?} score high score
     * @return {?}
     */
    GameService.prototype.saveHighScore = function (score) {
        this.highScore = score;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ st = this.getState();
            st.highScore = score;
            this.saveState(st);
        }
    };
    /**
     * delete high score, set to 0
     * @return {?}
     */
    GameService.prototype.deleteHighScore = function () {
        this.highScore = 0;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ st = this.getState();
            st.highScore = 0;
            this.saveState(st);
        }
    };
    /**
     * get current score
     * @return {?}
     */
    GameService.prototype.getScore = function () {
        return this.score;
    };
    /**
     * Save score, if config permit save in localstorage
     * @param {?} score current score
     * @return {?}
     */
    GameService.prototype.saveScore = function (score) {
        this.score = score;
        if (this.score > this.highScore) {
            this.saveHighScore(this.score);
        }
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ st = this.getState();
            st.score = score;
            this.saveState(st);
        }
    };
    /**
     * delete current score
     * @return {?}
     */
    GameService.prototype.deleteScore = function () {
        this.score = 0;
        if (this.defaultConfig && this.defaultConfig.rememberState) {
            // tslint:disable-next-line:prefer-const
            var /** @type {?} */ st = this.getState();
            st.score = 0;
            this.saveState(st);
        }
    };
    /**
     * Transpose a given array, return a new one
     * @param {?} m an array
     * @return {?}
     */
    GameService.prototype.transpose = function (m) {
        // tslint:disable-next-line:no-shadowed-variable
        return m[0].map(function (x, i) { return m.map(function (x) { return x[i]; }); });
    };
    /**
     * shallow copy the game state
     * @return {?}
     */
    GameService.prototype.getCopyState = function () {
        var /** @type {?} */ arr = [];
        arr = this.gameState.map(function (x) { return x.map(function (y) { return y; }); });
        return arr;
    };
    /**
     * Move the game array to left
     * @param {?} state the 2d array representation of the game
     * @return {?}
     */
    GameService.prototype.moveLeft = function (state) {
        var /** @type {?} */ myState = [];
        state.forEach(function (x) {
            myState.push(x.map(function (y) { return y; }));
        });
        var /** @type {?} */ noOfMoves = 0;
        var /** @type {?} */ score = this.getScore() || 0;
        for (var /** @type {?} */ i = 0; i < myState.length; i++) {
            /**
             * myState[i] contains each row
             */
            for (var /** @type {?} */ j = 0; j < myState[i].length; j++) {
                var /** @type {?} */ merged = false;
                for (var /** @type {?} */ k = j + 1; k < myState[i].length; k++) {
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
    };
    /**
     * @return {?}
     */
    GameService.prototype.checkDeadlock = function () {
        if (this.lastMoveDetails && this.lastMoveDetails.posLeft) {
            this.lastMoveDetails.deadlock = false;
            return;
        }
        /**
         * check row wise
         */
        var found = false;
        for (var /** @type {?} */ i = 0; i < this.gameState.length; i++) {
            for (var /** @type {?} */ j = 0; j < this.gameState[i].length - 1; j++) {
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
        for (var /** @type {?} */ i = 0; i < this.gameState.length - 1; i++) {
            for (var /** @type {?} */ j = 0; j < this.gameState[i].length; j++) {
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
    };
    /**
     * Move the game array to right
     * @param {?} state the 2d array representation of the game
     * @return {?}
     */
    GameService.prototype.moveRight = function (state) {
        var /** @type {?} */ myState = [];
        state.forEach(function (x) {
            myState.push(x.map(function (y) { return y; }));
        });
        var /** @type {?} */ noOfMoves = 0;
        var /** @type {?} */ score = this.getScore() || 0;
        for (var /** @type {?} */ i = 0; i < myState.length; i++) {
            /**
             * myState[i] contains each row
             */
            for (var /** @type {?} */ j = myState[i].length - 1; j >= 0; j--) {
                var /** @type {?} */ merged = false;
                for (var /** @type {?} */ k = j - 1; k >= 0; k--) {
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
    };
    /**
     * Merge config with default one
     * @param {?} config the config
     * @return {?}
     */
    GameService.prototype.mergeConfig = function (config) {
        var _this = this;
        if (!config) {
            return;
        }
        var /** @type {?} */ keys = Object.keys(config);
        keys.forEach(function (val) {
            _this.defaultConfig[val] = config[val];
        });
    };
    /**
     * get the current state (total game state including scores)
     * @return {?}
     */
    GameService.prototype.getState = function () {
        var /** @type {?} */ currentState = localStorage.getItem(this.STORAGE_NAME);
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
    };
    /**
     * Save the total game state
     * @param {?} state the total game state
     * @return {?}
     */
    GameService.prototype.saveState = function (state) {
        localStorage.setItem(this.STORAGE_NAME, JSON.stringify(state));
    };
    return GameService;
}());
GameService.decorators = [
    { type: core.Injectable },
];
/**
 * @nocollapse
 */
GameService.ctorParameters = function () { return []; };
var html2canvas = require("html2canvas");
var GameComponent = (function () {
    /**
     * @param {?} gameService
     * @param {?} cdr
     */
    function GameComponent(gameService, cdr) {
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
    Object.defineProperty(GameComponent.prototype, "config", {
        /**
         * @return {?}
         */
        get: function () {
            return this._config;
        },
        /**
         * @param {?} val
         * @return {?}
         */
        set: function (val) {
            this._config = val;
            this.gameService.saveConfig(this.config);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} event
     * @return {?}
     */
    GameComponent.prototype.handleKeyboardEvent = function (event) {
        this.handle_key(event);
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.ngOnInit = function () {
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.ngAfterViewInit = function () {
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
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.newgame = function () {
        this.gameService.newGame();
        this.gameState = this.gameService.getGameState();
        this.defaultConfig = this.gameService.getConfig();
        this.actionAllowed = true;
        this.lastAction = this.gameService.getLastMoveDetails();
        this.score = this.gameService.getScore();
        this.highScore = this.gameService.getHighscore();
        this.cdr.detectChanges();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GameComponent.prototype.handle_key = function (event) {
        if (this.defaultConfig.keys) {
            var /** @type {?} */ key = event.key.toLowerCase();
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
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.change_theme = function () {
        this.gameService.changeTheme(this.defaultConfig.theme);
        this.defaultConfig = this.gameService.getConfig();
    };
    /**
     * @param {?} action
     * @return {?}
     */
    GameComponent.prototype.swipe_a = function (action) {
        if (this.defaultConfig.touch) {
            this.swipe(action);
        }
    };
    /**
     * @param {?} action
     * @return {?}
     */
    GameComponent.prototype.swipe = function (action) {
        if (!this.actionAllowed) {
            return;
        }
        this.gameService.changeState(action);
        this.gameState = this.gameService.getGameState();
        this.score = this.gameService.getScore();
        this.highScore = this.gameService.getHighscore();
        this.cdr.detectChanges();
        this.addNewNo();
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.addNewNo = function () {
        var _this = this;
        var /** @type {?} */ lastMove = this.gameService.getLastMoveDetails();
        if (lastMove.moves && lastMove.moves > 0) {
            this.actionAllowed = false;
            setTimeout(function () {
                _this.gameService.setRandomNoPos();
                _this.actionAllowed = true;
                _this.cdr.detectChanges();
            }, 200);
        }
    };
    /**
     * @return {?}
     */
    GameComponent.prototype.screenshot = function () {
        var _this = this;
        var /** @type {?} */ doc = this.el.nativeElement;
        html2canvas(doc).then(function (canvas) {
            var /** @type {?} */ myImage = canvas.toDataURL("image/png");
            var /** @type {?} */ link = document.createElement("a");
            link.download = "Image_2024_score_" + _this.score + ".png";
            link.href = 'data: ' + myImage;
            link.click();
        }).catch(function (err) {
        });
    };
    return GameComponent;
}());
GameComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-game-2048',
                template: "\n    <div class=\"game-container {{defaultConfig ? defaultConfig.theme: ''}}\" (swipeleft)=\"swipe_a(SWIPE_ACTION.LEFT)\" (swiperight)=\"swipe_a(SWIPE_ACTION.RIGHT)\" (swipeup)=\"swipe_a(SWIPE_ACTION.UP)\" (swipedown)=\"swipe_a(SWIPE_ACTION.DOWN)\">\n      <div class=\"themecontrol\" *ngIf=\"defaultConfig && defaultConfig.themeControl\">\n        <form>\n          <select name=\"theme\" [(ngModel)]=\"defaultConfig.theme\" (change)=\"change_theme()\">\n            <option *ngFor=\"let opt of allThemes\" [value]=\"opt\" [selected]=\"opt === defaultConfig.theme\" style=\"text-transform: capitalize;\">{{opt}}</option>\n          </select>\n        </form>\n      </div>\n      <div class=\"stats\" *ngIf=\"defaultConfig && defaultConfig.scoreIndicator\">\n        <div class=\"highscore\">\n          <span class=\"txt\">High Score</span>\n          <span class=\"score\">{{highScore}}</span>\n        </div>\n        <div class=\"ngame\">\n          <button (click)=\"newgame()\">New Game</button>\n        </div>\n        <div class=\"currscore\">\n          <span class=\"txt\">Score</span>\n          <span class=\"score\">{{score}}</span>\n        </div>\n      </div>\n      <div class=\"board-container\" #game>\n        <div class=\"board-row\" *ngFor=\"let row of gameState\">\n          <div class=\"board-cell {{cell == 0 ? 'zero': 'num'+cell}}\" *ngFor=\"let cell of row\">\n            <span>{{cell == 0 ? '&nbsp;': cell}}</span>\n          </div>\n        </div>\n        <div class=\"over\" *ngIf=\"lastAction && lastAction.deadlock\">\n          <div class=\"container\">\n            <div class=\"text\">Game Over</div>\n            <div class=\"btn-cnt\">\n              <button class=\"newgame\" (click)=\"newgame()\">New Game</button>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class=\"control-container\" *ngIf=\"defaultConfig && defaultConfig.controls\">\n        <div class=\"btn-container\">\n            <div class=\"g_row\">\n                <button class=\"ctl-btn up\" (click)=\"swipe(SWIPE_ACTION.UP)\">&uarr;</button>\n            </div>\n            <div class=\"g_row\">\n                <button class=\"ctl-btn left\" (click)=\"swipe(SWIPE_ACTION.LEFT)\">&larr;</button>\n                <button class=\"btn-rnd\" (click)=\"screenshot()\">&#9786;</button>\n                <button class=\"ctl-btn right\" (click)=\"swipe(SWIPE_ACTION.RIGHT)\">&rarr;</button>\n            </div>\n            <div class=\"g_row\">\n                <button class=\"ctl-btn down\" (click)=\"swipe(SWIPE_ACTION.DOWN)\">&darr;</button>\n            </div>\n        </div>\n      </div>\n    </div>\n  ",
                styles: ["\n    .game-container {\n      width: 90%;\n      padding: 10px;\n      margin: 0 auto; }\n      .game-container .board-container {\n        position: relative;\n        -webkit-animation: MyAnimation 1s;\n                animation: MyAnimation 1s;\n        width: 100%; }\n        .game-container .board-container .board-row {\n          display: -webkit-box;\n          display: -ms-flexbox;\n          display: flex; }\n          .game-container .board-container .board-row .board-cell {\n            -webkit-box-flex: 1;\n                -ms-flex: auto;\n                    flex: auto;\n            min-width: 50px;\n            min-height: 70px;\n            background: #96cff5; }\n            .game-container .board-container .board-row .board-cell span {\n              display: block;\n              vertical-align: middle;\n              text-align: center;\n              margin: 34% 0; }\n        .game-container .board-container .over {\n          position: absolute;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background: rgba(189, 189, 189, 0.59); }\n          .game-container .board-container .over .container {\n            display: block;\n            text-align: center;\n            padding-top: 30%; }\n            .game-container .board-container .over .container .text {\n              font-size: 30px;\n              font-weight: 600;\n              color: #ffffff;\n              text-shadow: 0 0 12px #000; }\n            .game-container .board-container .over .container .btn-cnt .newgame {\n              padding: 5px;\n              margin: 5px;\n              font-size: 18px;\n              font-weight: 600;\n              -webkit-box-shadow: 0 0 12px #525252;\n                      box-shadow: 0 0 12px #525252; }\n      .game-container .control-container {\n        width: 100%;\n        text-align: center;\n        margin-top: 20px; }\n        .game-container .control-container .btn-container {\n          max-width: 70%;\n          width: auto;\n          margin: 0 auto;\n          border-radius: 50%;\n          background: #f3f3f3; }\n          .game-container .control-container .btn-container .g_row {\n            display: block;\n            width: 100%; }\n            .game-container .control-container .btn-container .g_row .ctl-btn {\n              background: #4c4c4c;\n              /* Old browsers */\n              /* FF3.6-15 */\n              /* Chrome10-25,Safari5.1-6 */\n              background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);\n              /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n              filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );\n              /* IE6-9 fallback on horizontal gradient */\n              outline: none;\n              min-width: 50px;\n              min-height: 50px;\n              cursor: pointer;\n              font-weight: 600;\n              font-size: 34px; }\n              .game-container .control-container .btn-container .g_row .ctl-btn:active {\n                outline: none; }\n            .game-container .control-container .btn-container .g_row .ctl-btn.up {\n              border-top-left-radius: 50%;\n              border-top-right-radius: 50%; }\n            .game-container .control-container .btn-container .g_row .ctl-btn.down {\n              border-bottom-left-radius: 50%;\n              border-bottom-right-radius: 50%; }\n            .game-container .control-container .btn-container .g_row .ctl-btn.left {\n              border-top-left-radius: 50%;\n              border-bottom-left-radius: 50%; }\n            .game-container .control-container .btn-container .g_row .ctl-btn.right {\n              border-top-right-radius: 50%;\n              border-bottom-right-radius: 50%; }\n            .game-container .control-container .btn-container .g_row .btn-rnd {\n              background: #3a3a3a;\n              outline: none;\n              color: #fff;\n              cursor: pointer;\n              font-weight: 600;\n              font-size: 34px;\n              border-radius: 20%; }\n      .game-container .stats {\n        width: 100%;\n        overflow: hidden;\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-shadow: 0 0 5px #000;\n                box-shadow: 0 0 5px #000;\n        margin: 10px 0;\n        padding: 5px 0;\n        border-radius: 5px; }\n        .game-container .stats .highscore {\n          -webkit-box-flex: 1;\n              -ms-flex: 1;\n                  flex: 1;\n          padding: 0 5px; }\n          .game-container .stats .highscore .txt {\n            display: -webkit-box;\n            display: -ms-flexbox;\n            display: flex;\n            color: #000;\n            font-weight: 600;\n            text-shadow: 0px 0px 2px #e2e2e2; }\n          .game-container .stats .highscore .score {\n            display: -webkit-box;\n            display: -ms-flexbox;\n            display: flex;\n            color: #000;\n            font-weight: 600;\n            font-size: 20px;\n            border-top: 1px double #000;\n            margin: 5px 0; }\n        .game-container .stats .ngame {\n          -webkit-box-flex: 1;\n              -ms-flex: 1;\n                  flex: 1; }\n          .game-container .stats .ngame button {\n            display: -webkit-box;\n            display: -ms-flexbox;\n            display: flex;\n            display: table-cell;\n            vertical-align: middle;\n            text-align: center;\n            width: 100%;\n            line-height: 1.4;\n            font-size: 17px;\n            font-weight: 600; }\n        .game-container .stats .currscore {\n          -webkit-box-flex: 1;\n              -ms-flex: 1;\n                  flex: 1;\n          text-align: right;\n          padding: 0 5px; }\n          .game-container .stats .currscore .txt {\n            display: block;\n            color: #000;\n            font-weight: 600;\n            text-shadow: 0px 0px 2px #e2e2e2; }\n          .game-container .stats .currscore .score {\n            display: block;\n            color: #000;\n            font-weight: 600;\n            font-size: 20px;\n            border-top: 1px double #000;\n            margin: 5px 0; }\n      .game-container .themecontrol {\n        -webkit-box-shadow: 0 0 10px rgba(136, 134, 134, 0.51);\n                box-shadow: 0 0 10px rgba(136, 134, 134, 0.51);\n        margin: 5px 0; }\n        .game-container .themecontrol select {\n          width: 100%;\n          height: 35px;\n          text-transform: capitalize;\n          font-size: 18px; }\n\n    @-webkit-keyframes MyAnimation {\n      0% {\n        padding-top: 25px; }\n      25% {\n        padding-top: 30px; }\n      50% {\n        padding-top: 10px; }\n      75% {\n        padding-top: 15px; }\n      80% {\n        padding-top: 5px; }\n      90% {\n        padding-top: 10px; }\n      100% {\n        padding-top: 0px; } }\n\n    @keyframes MyAnimation {\n      0% {\n        padding-top: 25px; }\n      25% {\n        padding-top: 30px; }\n      50% {\n        padding-top: 10px; }\n      75% {\n        padding-top: 15px; }\n      80% {\n        padding-top: 5px; }\n      90% {\n        padding-top: 10px; }\n      100% {\n        padding-top: 0px; } }\n\n    .game-container.dark .board-container {\n      background: #7b7b7b;\n      -webkit-box-shadow: 0 0 10px #989898;\n              box-shadow: 0 0 10px #989898;\n      border: 1px solid #333;\n      border-style: inset;\n      border-radius: 5px; }\n      .game-container.dark .board-container .board-row .board-cell {\n        background: #fff;\n        margin: 2px;\n        border-radius: 5px; }\n      .game-container.dark .board-container .board-row .board-cell.num2, .game-container.dark .board-container .board-row .board-cell.num256 {\n        background: #d0cbcb;\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.dark .board-container .board-row .board-cell.num4, .game-container.dark .board-container .board-row .board-cell.num512 {\n        background: #7b7b7b;\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.dark .board-container .board-row .board-cell.num8, .game-container.dark .board-container .board-row .board-cell.num1024 {\n        background: #2d2d2d;\n        color: #fff;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.dark .board-container .board-row .board-cell.num16, .game-container.dark .board-container .board-row .board-cell.num2048 {\n        background: #4c4c4c;\n        color: #fff;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000;\n        background: #4c4c4c;\n        /* Old browsers */\n        /* FF3.6-15 */\n        /* Chrome10-25,Safari5.1-6 */\n        background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);\n        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );\n        /* IE6-9 fallback on horizontal gradient */ }\n      .game-container.dark .board-container .board-row .board-cell.num32, .game-container.dark .board-container .board-row .board-cell.num4096 {\n        background: #171717;\n        color: #fff;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.dark .board-container .board-row .board-cell.num64 {\n        background: #000000;\n        color: #fff;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.dark .board-container .board-row .board-cell.num128 {\n        /* FF3.6-15 */\n        /* Chrome10-25,Safari5.1-6 */\n        background: -webkit-gradient(linear, left top, right top, color-stop(44%, rgba(0, 0, 0, 0.65)), color-stop(63%, rgba(0, 0, 0, 0.36)), color-stop(87%, transparent), to(transparent));\n        background: linear-gradient(to right, rgba(0, 0, 0, 0.65) 44%, rgba(0, 0, 0, 0.36) 63%, transparent 87%, transparent 100%);\n        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#a6000000', endColorstr='#00000000',GradientType=1 );\n        /* IE6-9 */\n        color: #fff; }\n\n    .game-container.dark .control-container .btn-container .g_row .ctl-btn {\n      color: #fff;\n      background: #4c4c4c;\n      /* Old browsers */\n      /* FF3.6-15 */\n      /* Chrome10-25,Safari5.1-6 */\n      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);\n      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );\n      /* IE6-9 fallback on horizontal gradient */ }\n\n    .game-container.dark .control-container .btn-container .g_row .btn-rnd {\n      background: #4c4c4c;\n      /* Old browsers */\n      /* FF3.6-15 */\n      /* Chrome10-25,Safari5.1-6 */\n      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);\n      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );\n      /* IE6-9 fallback on horizontal gradient */\n      color: #fff; }\n\n    .game-container.dark .stats {\n      background: #4c4c4c;\n      /* Old browsers */\n      /* FF3.6-15 */\n      /* Chrome10-25,Safari5.1-6 */\n      background: linear-gradient(135deg, #4c4c4c 0%, #595959 12%, #666666 25%, #474747 39%, #2c2c2c 50%, black 51%, #111111 60%, #2b2b2b 76%, #1c1c1c 91%, #131313 100%);\n      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c4c4c', endColorstr='#131313',GradientType=1 );\n      /* IE6-9 fallback on horizontal gradient */ }\n      .game-container.dark .stats .highscore .txt {\n        color: #fff;\n        text-shadow: none; }\n      .game-container.dark .stats .highscore .score {\n        color: #fff;\n        border-top: 1px double #fff; }\n      .game-container.dark .stats .currscore .txt {\n        color: #fff;\n        text-shadow: none; }\n      .game-container.dark .stats .currscore .score {\n        color: #fff;\n        border-top: 1px double #fff; }\n\n    .game-container.colorful .board-container {\n      background-color: #a8e9ff;\n      filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#a8e9ff, endColorstr=#4a3ef0);\n      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(5%, #a8e9ff), color-stop(25%, #4a3ef0), color-stop(52%, #3ef053), color-stop(80%, #ff8d00), to(#f7f734));\n      background-image: linear-gradient(right bottom, #a8e9ff 5%, #4a3ef0 25%, #3ef053 52%, #ff8d00 80%, #f7f734 100%);\n      background-image: -ms-linear-gradient(right bottom, #a8e9ff 5%, #4a3ef0 25%, #3ef053 52%, #ff8d00 80%, #f7f734 100%);\n      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(5%, #a8e9ff), color-stop(25%, #4a3ef0), color-stop(52%, #3ef053), color-stop(80%, #ff8d00), color-stop(100%, #f7f734));\n      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e0f3fa', endColorstr='#b6dffd',GradientType=1 );\n      /* IE6-9 fallback on horizontal gradient */\n      -webkit-box-shadow: 0 0 10px rgba(2, 97, 97, 0.78);\n              box-shadow: 0 0 10px rgba(2, 97, 97, 0.78);\n      border: 1px solid #7977fb;\n      border-style: inset;\n      border-radius: 5px; }\n      .game-container.colorful .board-container .board-row .board-cell {\n        background-color: #ffffff;\n        margin: 2px;\n        border-radius: 5px; }\n      .game-container.colorful .board-container .board-row .board-cell.num2, .game-container.colorful .board-container .board-row .board-cell.num256 {\n        background-color: #2ef245;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#2ef245, endColorstr=#cbff70);\n        background-image: -webkit-gradient(linear, left bottom, right top, from(#2ef245), to(#cbff70));\n        background-image: linear-gradient(left bottom, #2ef245 0%, #cbff70 100%);\n        background-image: -o-linear-gradient(left bottom, #2ef245 0%, #cbff70 100%);\n        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(0%, #2ef245), color-stop(100%, #cbff70));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #fff;\n                box-shadow: 0 0 2px #fff; }\n      .game-container.colorful .board-container .board-row .board-cell.num4, .game-container.colorful .board-container .board-row .board-cell.num512 {\n        background-color: #4b2ef2;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#4b2ef2, endColorstr=#5bc4f5);\n        background-image: -webkit-gradient(linear, left bottom, right top, from(#4b2ef2), to(#5bc4f5));\n        background-image: linear-gradient(left bottom, #4b2ef2 0%, #5bc4f5 100%);\n        background-image: -o-linear-gradient(left bottom, #4b2ef2 0%, #5bc4f5 100%);\n        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(0%, #4b2ef2), color-stop(100%, #5bc4f5));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #fff;\n                box-shadow: 0 0 2px #fff; }\n      .game-container.colorful .board-container .board-row .board-cell.num8, .game-container.colorful .board-container .board-row .board-cell.num1024 {\n        background-color: #f0b222;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#f0b222, endColorstr=#4251f5);\n        background-image: linear-gradient(right bottom, #f0b222 21%, #4251f5 81%);\n        background-image: -o-linear-gradient(right bottom, #f0b222 21%, #4251f5 81%);\n        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(21%, #f0b222), color-stop(81%, #4251f5));\n        color: #fff;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #fff;\n                box-shadow: 0 0 2px #fff; }\n      .game-container.colorful .board-container .board-row .board-cell.num16, .game-container.colorful .board-container .board-row .board-cell.num2048 {\n        background-color: #fc8d77;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#fc8d77, endColorstr=#a673ff);\n        background-image: -webkit-gradient(linear, right bottom, left top, from(#fc8d77), color-stop(81%, #a673ff));\n        background-image: linear-gradient(right bottom, #fc8d77 0%, #a673ff 81%);\n        background-image: -o-linear-gradient(right bottom, #fc8d77 0%, #a673ff 81%);\n        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #fc8d77), color-stop(81%, #a673ff));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.colorful .board-container .board-row .board-cell.num32, .game-container.colorful .board-container .board-row .board-cell.num4096 {\n        background-color: #ffff29;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#ffff29, endColorstr=#ff73ce);\n        background-image: -webkit-gradient(linear, right bottom, left top, from(#ffff29), color-stop(81%, #ff73ce));\n        background-image: linear-gradient(right bottom, #ffff29 0%, #ff73ce 81%);\n        background-image: -o-linear-gradient(right bottom, #ffff29 0%, #ff73ce 81%);\n        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #ffff29), color-stop(81%, #ff73ce));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.colorful .board-container .board-row .board-cell.num64 {\n        background-color: #a2a8eb;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#a2a8eb, endColorstr=#b5b5b5);\n        background-image: -webkit-gradient(linear, right bottom, left top, from(#a2a8eb), color-stop(81%, #b5b5b5));\n        background-image: linear-gradient(right bottom, #a2a8eb 0%, #b5b5b5 81%);\n        background-image: -o-linear-gradient(right bottom, #a2a8eb 0%, #b5b5b5 81%);\n        background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #a2a8eb), color-stop(81%, #b5b5b5));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n      .game-container.colorful .board-container .board-row .board-cell.num128 {\n        background-color: #3d8ef2;\n        filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#3d8ef2, endColorstr=#68cf5d);\n        background-image: linear-gradient(left bottom, #3d8ef2 11%, #68cf5d 51%, #f0b52e 86%);\n        background-image: -ms-linear-gradient(left bottom, #3d8ef2 11%, #68cf5d 51%, #f0b52e 86%);\n        background-image: -webkit-gradient(linear, left bottom, right top, color-stop(11%, #3d8ef2), color-stop(51%, #68cf5d), color-stop(86%, #f0b52e));\n        color: #000;\n        font-size: initial;\n        font-weight: 600;\n        -webkit-box-shadow: 0 0 2px #000;\n                box-shadow: 0 0 2px #000; }\n\n    .game-container.colorful .control-container .btn-container {\n      background-color: #80d7ff;\n      filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=#80d7ff, endColorstr=#53f55b);\n      background-image: -webkit-gradient(linear, right bottom, left top, from(#80d7ff), color-stop(31%, #53f55b), color-stop(53%, #628ef5), color-stop(79%, #ccb221), to(#ff7070));\n      background-image: linear-gradient(right bottom, #80d7ff 0%, #53f55b 31%, #628ef5 53%, #ccb221 79%, #ff7070 100%);\n      background-image: -ms-linear-gradient(right bottom, #80d7ff 0%, #53f55b 31%, #628ef5 53%, #ccb221 79%, #ff7070 100%);\n      background-image: -webkit-gradient(linear, right bottom, left top, color-stop(0%, #80d7ff), color-stop(31%, #53f55b), color-stop(53%, #628ef5), color-stop(79%, #ccb221), color-stop(100%, #ff7070)); }\n      .game-container.colorful .control-container .btn-container .g_row .ctl-btn {\n        color: #000;\n        background: #b7deed;\n        /* Old browsers */\n        /* FF3.6-15 */\n        /* Chrome10-25,Safari5.1-6 */\n        background: linear-gradient(135deg, #b7deed 0%, #71ceef 50%, #21b4e2 51%, #b7deed 100%);\n        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7deed', endColorstr='#b7deed',GradientType=1 );\n        /* IE6-9 fallback on horizontal gradient */ }\n      .game-container.colorful .control-container .btn-container .g_row .btn-rnd {\n        background: #b7deed;\n        /* Old browsers */\n        /* FF3.6-15 */\n        /* Chrome10-25,Safari5.1-6 */\n        background: linear-gradient(135deg, #b7deed 0%, #71ceef 50%, #21b4e2 51%, #b7deed 100%);\n        /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7deed', endColorstr='#b7deed',GradientType=1 );\n        /* IE6-9 fallback on horizontal gradient */\n        color: #000; }\n\n    .game-container.colorful .stats {\n      background: #ffb76b;\n      /* Old browsers */\n      /* FF3.6-15 */\n      /* Chrome10-25,Safari5.1-6 */\n      background: linear-gradient(135deg, #ffb76b 0%, #ffa73d 50%, #ff7c00 51%, #ff7f04 100%);\n      /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffb76b', endColorstr='#ff7f04',GradientType=1 );\n      /* IE6-9 fallback on horizontal gradient */ }\n      .game-container.colorful .stats .highscore .txt {\n        color: #000;\n        text-shadow: none; }\n      .game-container.colorful .stats .highscore .score {\n        color: #000;\n        border-top: 1px double #000; }\n      .game-container.colorful .stats .currscore .txt {\n        color: #000;\n        text-shadow: none; }\n      .game-container.colorful .stats .currscore .score {\n        color: #000;\n        border-top: 1px double #000; }\n  "],
                providers: [GameService]
            },] },
];
/**
 * @nocollapse
 */
GameComponent.ctorParameters = function () { return [
    { type: GameService, },
    { type: core.ChangeDetectorRef, },
]; };
GameComponent.propDecorators = {
    'el': [{ type: core.ViewChild, args: ['game',] },],
    'config': [{ type: core.Input },],
    'handleKeyboardEvent': [{ type: core.HostListener, args: ['document:keyup', ['$event'],] },],
};
var MyHammerConfig = (function (_super) {
    __extends(MyHammerConfig, _super);
    function MyHammerConfig() {
        var _this = _super.apply(this, arguments) || this;
        _this.overrides = ({
            'swipe': { velocity: 0.4, threshold: 20, direction: 31 } // override default settings
        });
        return _this;
    }
    return MyHammerConfig;
}(platformBrowser.HammerGestureConfig));
var Ng2048Module = (function () {
    function Ng2048Module() {
    }
    return Ng2048Module;
}());
Ng2048Module.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule,
                    forms.FormsModule,
                ],
                declarations: [GameComponent],
                providers: [{
                        provide: platformBrowser.HAMMER_GESTURE_CONFIG,
                        useClass: MyHammerConfig
                    }],
                exports: [GameComponent]
            },] },
];
/**
 * @nocollapse
 */
Ng2048Module.ctorParameters = function () { return []; };

exports.Ng2048Module = Ng2048Module;
exports.GameService = GameService;
exports.GameComponent = GameComponent;
exports.ɵa = MyHammerConfig;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx2048.umd.js.map
