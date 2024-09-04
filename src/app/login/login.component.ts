import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  fullName: string,
  email: string,
  password: string,
  isLoggedIn: number
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  message: string = '';
  successMessage: boolean = false;

  constructor(private router: Router) { }
  ngOnInit(): void {
    const existingUsers = localStorage.getItem('userDetails');
    const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
    users.forEach((user: User) => {
      user.isLoggedIn = 0;
    });
    localStorage.removeItem('userDetails');
    localStorage.setItem('userDetails', JSON.stringify(users))
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.message = 'Please fill in all required fields.';
      this.successMessage = false;
      return;
    }

    // Fetch existing user details from local storage
    const existingUsers = localStorage.getItem('userDetails');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    const user = users.find((u: { email: string; password: string }) => u.email === this.email.toLowerCase() && u.password === this.password);
    if (user) {
      // User is found, redirect to dashboard or another page
      this.message = 'Login successful!';
      this.successMessage = true;
      user.isLoggedIn = 1;
      localStorage.removeItem('userDetails');
      localStorage.setItem('userDetails', JSON.stringify(users))
      setTimeout(() => {
        this.router.navigate(['/dashboard']); // Change this to your desired route
      }, 1000);
    } else {
      // Invalid credentials
      this.message = 'Invalid email or password.';
      this.successMessage = false;
    }
  }
}
