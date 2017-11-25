import { OnInit, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { GameService } from '../game.service';
export declare class GameComponent implements OnInit, AfterViewInit {
    private gameService;
    private cdr;
    private _config;
    el: ElementRef;
    config: any;
    SWIPE_ACTION: {
        LEFT: string;
        RIGHT: string;
        UP: string;
        DOWN: string;
    };
    gameState: any;
    defaultConfig: any;
    actionAllowed: boolean;
    lastAction: any;
    score: number;
    highScore: number;
    allThemes: string[];
    handleKeyboardEvent(event: KeyboardEvent): void;
    constructor(gameService: GameService, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    newgame(): void;
    handle_key(event: KeyboardEvent): void;
    change_theme(): void;
    swipe_a(action: string): void;
    swipe(action: string): void;
    addNewNo(): void;
    screenshot(): void;
}
