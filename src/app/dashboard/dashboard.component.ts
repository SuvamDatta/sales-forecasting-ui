import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataFetchService } from '../data-fetch.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  storeNames: string[] = ['The Corner Store','Market Basket', 'Main Street Mart'];
  productCategories: string[] = ['Gaming Console','Guitar','Clarinet'];
  years: string[] = ['2024', '2025','2026','2027'];
  months: string[] = ['01', '02', '03','04','05','06','07','08', '09'];
  
  selectedStoreName: string = '';
  selectedProductCategory: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  lineChart: any;
  barChart: any;

  constructor(private dataFetchService: DataFetchService) {}

  ngOnInit(): void {}

  onSelectionChange(): void {
    const prompt = `${this.selectedMonth ? this.selectedMonth + '-' : ''}${this.selectedYear}|${this.selectedStoreName}|${this.selectedProductCategory}`;
    this.dataFetchService.getData(prompt).subscribe(data => {
      this.createCharts(data);
    });
  }

  createCharts(data: any[]): void {
    const labels = data.map(d => d.Date);
    const stockSold = data.map(d => d.Stock_Sold);

    // Line Chart
    const lineCanvas = document.getElementById('lineChart') as HTMLCanvasElement;
    const lineCtx = lineCanvas.getContext('2d');
    if (this.lineChart) this.lineChart.destroy();
    this.lineChart = new Chart(lineCtx as CanvasRenderingContext2D, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Stock Sold',
          data: stockSold,
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        }]
      }
    });

    // Bar Chart
    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    const barCtx = barCanvas.getContext('2d');
    if (this.barChart) this.barChart.destroy();
    this.barChart = new Chart(barCtx as CanvasRenderingContext2D, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Stock Sold',
          data: stockSold,
          backgroundColor: 'orange'
        }]
      }
    });
  }
}
