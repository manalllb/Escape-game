import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-defeat-page',
  imports: [CommonModule],
  templateUrl: './defeat-page.html',
  styleUrl: './defeat-page.css'
})
export class DefeatPage {

  result: { finalCode?: string } = {};

  constructor(
    private gameState: GameStateService,
    private router: Router
  ) {
    this.result = (this.gameState.getGameResult() as typeof this.result) || {};
  }

  restart() {
    this.gameState.reset();
    this.router.navigate(['/']);
  }
}
