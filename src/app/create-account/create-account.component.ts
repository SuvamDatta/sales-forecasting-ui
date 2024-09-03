import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';
  successMessage: boolean = false;

  constructor(private router: Router) {}

  onCreateAccount() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match!';
      this.successMessage = false;
      return;
    }

    if (!this.fullName || !this.email || !this.password) {
      this.message = 'Please fill in all required fields.';
      this.successMessage = false;
      return;
    }

    const userDetails = {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    };

    // Save to local storage
    localStorage.setItem('userDetails', JSON.stringify(userDetails));

    // Optionally, navigate to another page after account creation
    this.router.navigate(['/login']);

    this.message = 'Account created successfully!';
    this.successMessage = true;
  }
}
