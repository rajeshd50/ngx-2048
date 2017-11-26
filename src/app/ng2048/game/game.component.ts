import { Component, 
         OnInit, 
         Input, 
         Output, 
         AfterViewInit, 
         ChangeDetectorRef, 
         HostListener,
         ViewChild,
         ElementRef 
       } from '@angular/core';
import { GameService } from '../game.service';
var html2canvas = require("html2canvas");

@Component({
  selector: 'app-game-2048',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  providers: [GameService]
})
export class GameComponent implements OnInit, AfterViewInit {
  private _config: any;
  @ViewChild('game') el:ElementRef;

  @Input() get config() {
    return this._config;
  }
  set config(val) {
    this._config = val;
    this.gameService.saveConfig(this.config);
  }

  SWIPE_ACTION = { LEFT: 'LEFT', RIGHT: 'RIGHT', UP: 'UP', DOWN: 'DOWN' };

  gameState: any = [];
  defaultConfig: any = {};
  actionAllowed = false;
  lastAction: any = {};
  score: number = 0;
  highScore: number = 0;

  allThemes: string[];

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handle_key(event);
  }

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) { 
  }

  ngOnInit() {
  }

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

  handle_key(event: KeyboardEvent) {
    if (this.defaultConfig.keys) {
      let key = event.key.toLowerCase();

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
          // do nothing
      }
    }
  }

  change_theme() {
    this.gameService.changeTheme(this.defaultConfig.theme);
    this.defaultConfig = this.gameService.getConfig();
  }

  swipe_a(action: string) {
    if (this.defaultConfig.touch) {
      this.swipe(action);
    }
  }
  swipe(action: string) {
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

  addNewNo() {

    let lastMove = this.gameService.getLastMoveDetails();

    if (lastMove.moves && lastMove.moves > 0) {
        this.actionAllowed = false;
        setTimeout(() => {
          this.gameService.setRandomNoPos();
          this.actionAllowed = true;
          this.cdr.detectChanges();
        }, 200);
    }
  }

  screenshot() {
    let doc: HTMLElement = this.el.nativeElement;
    html2canvas(doc).then(canvas => {
      var myImage = canvas.toDataURL("image/png");
      var link = document.createElement("a");
      link.download = `Image_2024_score_${this.score}.png`;
      link.href = 'data: '+myImage;
      link.click();
    }).catch(err => {

    })
  }
}
