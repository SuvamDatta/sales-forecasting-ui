import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataFetchService } from './data-fetch.service';
import { MatTableModule } from '@angular/material/table';
import { LoginComponent } from './login/login.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { CreateAccountComponent } from './create-account/create-account.component';
import { DecimalPipe } from '@angular/common';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ProductDetailsModalComponent } from './product-details-modal/product-details-modal.component';
import { StoreDetailsModalComponent } from './store-details-modal/store-details-modal.component';

Chart.register(annotationPlugin);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    CreateAccountComponent,
    ProductDetailsModalComponent,
    StoreDetailsModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    NgChartsModule,
    MatCardModule,
    MatIconModule,
    AppRoutingModule
  ],
  providers: [DataFetchService,DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
