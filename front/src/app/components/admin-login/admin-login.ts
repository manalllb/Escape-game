import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  adminEmail = '';
  adminPassword = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private gameState: GameStateService,
    private router: Router
  ) {
    this.adminEmail = this.gameState.getAdminEmail();
  }

  private formatLoginError(err: Error & { status?: number }): string {
    switch (err.status) {
      case 401:
        return 'Email ou mot de passe incorrect.';
      case 400:
        return 'Veuillez remplir tous les champs.';
      default:
        return err.message || 'Une erreur inattendue est survenue. Réessayez.';
    }
  }

  handleSubmit() {
    this.error = '';
    this.loading = true;

    this.authService.login(this.adminEmail, this.adminPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.gameState.setToken(response.token);
        this.gameState.setAdminEmail(response.email);
        this.gameState.setError('');
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.formatLoginError(err);
      }
    });
  }
}
