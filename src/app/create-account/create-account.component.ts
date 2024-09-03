import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  fullName: string,
  email: string,
  password: string,
  isLoggedIn: number
}

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
  existinguser: string = '';
  constructor(private router: Router) { }

  onCreateAccount() {
    
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'Please fill in all required fields.';
      this.successMessage = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match!';
      this.successMessage = false;
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.message = 'Please validated email address';
      this.successMessage = false;
      return;
    }
    
    const userDetails = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      isLoggedIn:0
    };
    const existingUsers = localStorage.getItem('userDetails');
    let users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
    const user = users.find(user => user.email == this.email);
    if (user) {
      this.message = 'Account already exists!';
      this.successMessage = false;
    }
    else {
      users.push({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        isLoggedIn:0
      });
      // Save updated user details back to local storage
      localStorage.setItem('userDetails', JSON.stringify(users));
      this.message = 'Account created successfully!';
      this.successMessage = true;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    }
  }
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
}
