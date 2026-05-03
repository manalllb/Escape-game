import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game-intro',
  imports: [CommonModule],
  templateUrl: './game-intro.html',
  styleUrl: './game-intro.css'
})
export class GameIntro implements OnInit {

  sessionPin = '';

  pseudo = '';

  constructor(
    private gameState: GameStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessionPin = this.gameState.getSessionPin();
    this.pseudo = this.gameState.getPseudo();
  }

  startGame() {
    this.router.navigate(['/game']);
  }
}
