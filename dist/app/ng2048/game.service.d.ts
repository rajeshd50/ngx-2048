export declare class GameService {
    private defaultConfig;
    private SUPPORTED_THEMES;
    private STORAGE_NAME;
    private highScore;
    private gameState;
    private score;
    private lastMoveDetails;
    constructor();
    test(): void;
    /**
     * for print debug display
     */
    debug(): void;
    /**
     * init the game, check localstorage if config permit
     * otherwise start a fresh game
     */
    init(): void;
    newGame(): void;
    /**
     * Set a random position in the state with a random number,
     * return true if success, false otherwise. If false no such empty
     * block available, that means game ends.
     */
    setRandomNoPos(): boolean;
    getLastMoveDetails(): any;
    changeTheme(theme: string): void;
    /**
     * change the game state according the action
     * @param direction direction of the operation, [LEFT, RIGHT, UP, DOWN]
     */
    changeState(direction: any): void;
    /**
     * Get current config
     */
    getConfig(): {
        grid: number;
        touch: boolean;
        controls: boolean;
        keys: boolean;
        themeControl: boolean;
        scoreIndicator: boolean;
        highScore: boolean;
        rememberState: boolean;
        theme: string;
    };
    /**
     * Get all supported themes
     */
    getAllThemes(): string[];
    /**
     * Save the game state, if config permit save to localstorage
     * @param gameState 2d representation of the game
     */
    storeGameState(gameState: any): void;
    /**
     * get game 2d array representation
     */
    getGameState(): any[];
    /**
     * get config object
     * @param config game configuration
     */
    saveConfig(config: any): void;
    /**
     * get high score
     */
    getHighscore(): number;
    /**
     * save high score, if config permit save in localstorage
     * @param score high score
     */
    saveHighScore(score: number): void;
    /**
     * delete high score, set to 0
     */
    deleteHighScore(): void;
    /**
     * get current score
     */
    getScore(): number;
    /**
     * Save score, if config permit save in localstorage
     * @param score current score
     */
    saveScore(score: number): void;
    /**
     * delete current score
     */
    deleteScore(): void;
    /**
     * Transpose a given array, return a new one
     * @param m an array
     */
    private transpose(m);
    /**
     * shallow copy the game state
     */
    private getCopyState();
    /**
     * Move the game array to left
     * @param state the 2d array representation of the game
     */
    private moveLeft(state);
    private checkDeadlock();
    /**
     * Move the game array to right
     * @param state the 2d array representation of the game
     */
    private moveRight(state);
    /**
     * Merge config with default one
     * @param config the config
     */
    private mergeConfig(config);
    /**
     * get the current state (total game state including scores)
     */
    private getState();
    /**
     * Save the total game state
     * @param state the total game state
     */
    private saveState(state);
}
