import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';
  successMessage: boolean = false;

  constructor(private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.message = 'Please fill in all required fields.';
      this.successMessage = false;
      return;
    }

    // Fetch existing user details from local storage
    const existingUsers = localStorage.getItem('userDetails');
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    // Find user with matching email and password
    const user = users.find((u: { email: string; password: string }) => u.email === this.email && u.password === this.password);

    if (user) {
      // User is found, redirect to dashboard or another page
      this.message = 'Login successful!';
      this.successMessage = true;
      setTimeout(() => {
        this.router.navigate(['/dashboard']); // Change this to your desired route
      }, 1000); // Redirect after 1 second
    } else {
      // Invalid credentials
      this.message = 'Invalid email or password.';
      this.successMessage = false;
    }
  }
}
