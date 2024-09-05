import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataFetchService } from '../data-fetch.service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

type ProductCategory = 'Clarinet' | 'Guitar' | 'Gaming Console';
interface User {
  fullName: string,
  email: string,
  password: string,
  isLoggedIn: number
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['Date', 'Store_Name', 'Product_Category', 'Stock_Sold', 'Sales'];
  storeNames: string[] = ['The Corner Store', 'Market Basket', 'Main Street Mart'];
  productCategories: ProductCategory[] = ['Gaming Console', 'Guitar', 'Clarinet'];
  years: string[] = ['2024', '2025', '2026', '2027'];
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];

  selectedStoreName: string = '';
  selectedProductCategory: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';
  username: string = '';

  lineChart: any;
  barChart: any;
  previousYearData: any;
  PrevYearConsolidatedData: any;
  prevYear: string = ''
  showChart:boolean=false;

  highlightedItems: { label: string, value: string }[] = [
    { label: 'Total Sales', value: '$0' },
    { label: 'Projected Total Stock Sold', value: '0' },
    { label: 'Highest Selling Product', value: 'None' },
    { label: 'Lowest Selling Product', value: 'None' },
    { label: 'Top Store', value: 'None' }
  ];
  PrevYrhighlightedItems: { label: string, value: string }[] = [
    { label: 'Total Sales', value: '$0' },
    { label: 'Projected Total Stock Sold', value: '0' },
    { label: 'Highest Selling Product', value: 'None' },
    { label: 'Lowest Selling Product', value: 'None' },
    { label: 'Top Store', value: 'None' }
  ];

  constructor(private dataFetchService: DataFetchService, private router: Router, private decimalPipe: DecimalPipe) { }

  ngOnInit(): void {
    const existingUsers = localStorage.getItem('userDetails');
    let users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
    const user = users.find(user => user.isLoggedIn == 1);
    if (user) {
      //user is logged in
      this.username = user.fullName.split(' ')[0];
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  onSelectionChange(): void {
    // Construct the prompt with the selected values
    const monthPart = this.selectedMonth ? `${this.selectedMonth}-` : '-';
    const yearPart = this.selectedYear ? `${this.selectedYear}` : '';
    const prompt = `${monthPart}${yearPart}|${this.selectedStoreName}|${this.selectedProductCategory}`;

    // Make the API call with the current selections
    if (this.selectedStoreName || this.selectedProductCategory || this.selectedYear || this.selectedMonth) {
      const previousYear = (parseInt(this.selectedYear, 10) - 1).toString();
      const previousYearPrompt = `${monthPart}${previousYear}|${this.selectedStoreName}|${this.selectedProductCategory}`;
      this.prevYear = previousYear
      this.dataFetchService.getData(prompt).subscribe(data => {
        this.createCharts(data);
        this.updateHighlightedItems(data, true);
        this.showChart = true;
      });

      // Handle previous year data
      if (this.selectedYear) {
        this.dataFetchService.getData(previousYearPrompt).subscribe(previousYearData => {
          this.previousYearData = previousYearData;
          this.updateHighlightedItems(previousYearData, false);
          this.showChart = true;
        });

      } else {
        // Clear previous year data if no year is selected
        this.clearParams();
      }
    } else {
      // Clear previous year data if no selection is made
      this.clearParams();
    }
  }

  clearParams(){
    this.previousYearData = null;
    this.prevYear = '';
    let totalSales = 0;
    let totalStockSold = 0;
    let highestSellingProduct = 'None';
    let lowestSellingProduct = 'None';
    let topStore = 'None';
    this.highlightedItems = [
      { label: 'Total Sales', value: `$${totalSales}` },
      { label: 'Projected Total Stock Sold', value: totalStockSold.toString() },
      { label: 'Highest Selling Product', value: highestSellingProduct },
      { label: 'Lowest Selling Product', value: lowestSellingProduct },
      { label: 'Top Store', value: topStore || 'None' }
    ];
    this.PrevYrhighlightedItems = [
      { label: 'Total Sales', value: `$${totalSales}` },
      { label: 'Projected Total Stock Sold', value: totalStockSold.toString() },
      { label: 'Highest Selling Product', value: highestSellingProduct },
      { label: 'Lowest Selling Product', value: lowestSellingProduct },
      { label: 'Top Store', value: topStore || 'None' }
    ];
    this.showChart = false;
    this.barChart.destroy();
    this.lineChart.destroy();
  }

  constructPrompt(year: string): string {
    const monthPart = this.selectedMonth ? `${this.selectedMonth}-` : '-';
    const yearPart = year;
    return `${monthPart}${yearPart}|${this.selectedStoreName}|${this.selectedProductCategory}`;
  }

  updateHighlightedItems(data: any[], currentYr: boolean): void {
    if (data.length > 0) {
      let totalSales = data.reduce((sum, item) => sum + (item.Sales || 0), 0);
      let totalStockSold = data.reduce((sum, item) => sum + (item.Stock_Sold || 0), 0);
      const sortedData = [...data].sort((a, b) => (b.Sales || 0) - (a.Sales || 0));
      const highestSellingProduct = sortedData[0] ? sortedData[0].Product_Category : 'None';
      const lowestSellingProduct = sortedData[sortedData.length - 1] ? sortedData[sortedData.length - 1].Product_Category : 'None';

      const storeSales = data.reduce((acc, item) => {
        acc[item.Store_Name] = (acc[item.Store_Name] || 0) + (item.Sales || 0);
        return acc;
      }, {} as Record<string, number>);

      totalSales = this.decimalPipe.transform(totalSales, '1.0-0');
      totalStockSold = this.decimalPipe.transform(totalStockSold, '1.0-0');

      const topStore = Object.keys(storeSales).reduce((a, b) => storeSales[a] > storeSales[b] ? a : b, '');
      if (currentYr) {
        this.highlightedItems = [
          { label: 'Total Sales', value: `$${totalSales}` },
          { label: 'Projected Total Stock Sold', value: totalStockSold.toString() },
          { label: 'Highest Selling Product', value: highestSellingProduct },
          { label: 'Lowest Selling Product', value: lowestSellingProduct },
          { label: 'Top Store', value: topStore || 'None' }
        ];
      }
      else {
        this.PrevYrhighlightedItems = [
          { label: 'Total Sales', value: `$${totalSales}` },
          { label: 'Projected Total Stock Sold', value: totalStockSold.toString() },
          { label: 'Highest Selling Product', value: highestSellingProduct },
          { label: 'Lowest Selling Product', value: lowestSellingProduct },
          { label: 'Top Store', value: topStore || 'None' }
        ];
      }
    }
  }

  createCharts(data: any[]): void {
    const labels = [...new Set(data.map(d => d.Date))];
    const productCategories = [...new Set(data.map(d => d.Product_Category))] as ProductCategory[];
  
    const datasets = productCategories.map(category => {
      return {
        label: category,
        data: labels.map(date => {
          const entry = data.find(d => d.Date === date && d.Product_Category === category);
          return entry ? entry.Sales : 0;
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
              label: (context) => `${context.dataset.label}: ${context.raw}`
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const elementIndex = elements[0].index;
            const clickedDate = labels[elementIndex];
            const clickedCategory = datasets[elements[0].datasetIndex].label;
            this.handleChartClick(clickedDate, clickedCategory, 'line');
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
              label: (context) => `${context.dataset.label}: ${context.raw}`
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const elementIndex = elements[0].index;
            const clickedDate = labels[elementIndex];
            const clickedCategory = datasets[elements[0].datasetIndex].label;
            this.handleChartClick(clickedDate, clickedCategory, 'bar');
          }
        }
      }
    });
  }
  handleChartClick(date: string, category: string, chartType: string): void {
    // console.log(`Clicked on ${chartType} chart! Date: ${date}, Product Category: ${category}`);
    // alert(`You clicked on ${chartType} chart for ${category} on ${date}`);
  }
    

  getColor(category: ProductCategory, isBackground: boolean = false): string {
    const colors: Record<ProductCategory, string> = {
      'Clarinet': isBackground ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 1)',
      'Guitar': isBackground ? 'rgba(54, 162, 235, 0.2)' : 'rgba(54, 162, 235, 1)',
      'Gaming Console': isBackground ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 1)',
    };
    return colors[category] || (isBackground ? 'rgba(201, 203, 207, 0.2)' : 'rgba(201, 203, 207, 1)');
  }

  onLogout(): void {
    localStorage.removeItem('isLoggedIn')
    this.router.navigate(['/login']);
  }
}
