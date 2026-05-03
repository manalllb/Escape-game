import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-welcome-page',
  imports: [CommonModule],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.css'
})
export class WelcomePage {

  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {}

  goAdmin() {
    this.gameState.setError('');
    this.router.navigate(['/admin-login']);
  }

  goPlayer() {
    this.gameState.setError('');
    this.router.navigate(['/join']);
  }
}
