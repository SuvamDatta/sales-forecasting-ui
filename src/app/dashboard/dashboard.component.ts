import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataFetchService } from '../data-fetch.service';
import { forkJoin } from 'rxjs';

type ProductCategory = 'Clarinet' | 'Guitar' | 'Gaming Console';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  storeNames: string[] = ['The Corner Store', 'Market Basket', 'Main Street Mart'];
  productCategories: ProductCategory[] = ['Gaming Console', 'Guitar', 'Clarinet'];
  years: string[] = ['2024', '2025', '2026', '2027'];
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];

  selectedStoreName: string = '';
  selectedProductCategory: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  lineChart: any;
  barChart: any;
  previousYearData: any;

  constructor(private dataFetchService: DataFetchService) {}

  ngOnInit(): void {}

  onSelectionChange(): void {
    // Construct the prompt with the selected values
    const monthPart = this.selectedMonth ? `${this.selectedMonth}-` : '-';
    const yearPart = this.selectedYear ? `${this.selectedYear}` : '';
    const prompt = `${monthPart}${yearPart}|${this.selectedStoreName}|${this.selectedProductCategory}`;
  
    // Make the API call with the current selections
    if (this.selectedStoreName || this.selectedProductCategory || this.selectedYear || this.selectedMonth) {
      this.dataFetchService.getData(prompt).subscribe(data => {
        this.createCharts(data);
      });
  
      // Handle previous year data
      if (this.selectedYear) {
        const previousYear = (parseInt(this.selectedYear, 10) - 1).toString();
        const previousYearPrompt = `${monthPart}${previousYear}|${this.selectedStoreName}|${this.selectedProductCategory}`;
        this.dataFetchService.getData(previousYearPrompt).subscribe(previousYearData => {
          this.previousYearData = previousYearData;
        });
      } else {
        // Clear previous year data if no year is selected
        this.previousYearData = null;
      }
    } else {
      // Clear previous year data if no selection is made
      this.previousYearData = null;
    }
  }
  
  

  constructPrompt(year: string): string {
    const monthPart = this.selectedMonth ? `${this.selectedMonth}-` : '-';
    const yearPart = year;
    return `${monthPart}${yearPart}|${this.selectedStoreName}|${this.selectedProductCategory}`;
  }

  createCharts(data: any[]): void {
    const labels = [...new Set(data.map(d => d.Date))];
    const productCategories = [...new Set(data.map(d => d.Product_Category))] as ProductCategory[];

    const datasets = productCategories.map(category => {
      return {
        label: category,
        data: labels.map(date => {
          const entry = data.find(d => d.Date === date && d.Product_Category === category);
          return entry ? entry.Stock_Sold : 0;
        }),
        fill: false,
        borderColor: this.getColor(category),
        backgroundColor: this.getColor(category, true),
        borderWidth: 2
      };
    });

    // Line Chart
    const lineCanvas = document.getElementById('lineChart') as HTMLCanvasElement;
    const lineCtx = lineCanvas.getContext('2d');
    if (this.lineChart) this.lineChart.destroy();
    this.lineChart = new Chart(lineCtx as CanvasRenderingContext2D, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        }
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
        datasets: datasets.map(dataset => ({
          ...dataset,
          type: 'bar', // Ensure bars for bar chart
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor
        }))
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  getColor(category: ProductCategory, isBackground: boolean = false): string {
    const colors: Record<ProductCategory, string> = {
      'Clarinet': isBackground ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 1)',
      'Guitar': isBackground ? 'rgba(54, 162, 235, 0.2)' : 'rgba(54, 162, 235, 1)',
      'Gaming Console': isBackground ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 1)',
    };
    return colors[category] || (isBackground ? 'rgba(201, 203, 207, 0.2)' : 'rgba(201, 203, 207, 1)');
  }
}
