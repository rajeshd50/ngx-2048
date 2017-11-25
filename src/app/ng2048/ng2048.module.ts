import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': {velocity: 0.4, threshold: 20, direction: 31 } // override default settings
  };
}
@NgModule({
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
})
export class Ng2048Module { }
