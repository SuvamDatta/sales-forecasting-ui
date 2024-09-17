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

  showModal=false; //to control product modal visibility
  selectedProduct:any; // for product details popup
  showStoreModal = false; // To control store modal visibility
  selectedStore: any; // Store the selected store's details
  productStockAndSales: any; // Stores stock and sales data for the selected product

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
      this.dataFetchService.getPrevYearData(prompt).subscribe(data => {
        this.createCharts(data);
        this.updateHighlightedItems(data, true);
        this.showChart = true;
      });

      // Handle previous year data
      if (this.selectedYear) {
        this.dataFetchService.getPrevYearData(previousYearPrompt).subscribe(previousYearData => {
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

  getColor(category: ProductCategory, isBackground: boolean = false): string {
    const colors: Record<ProductCategory, string> = {
      'Clarinet': isBackground ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 1)',
      'Guitar': isBackground ? 'rgba(54, 162, 235, 0.2)' : 'rgba(54, 162, 235, 1)',
      'Gaming Console': isBackground ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 1)',
    };
    return colors[category] || (isBackground ? 'rgba(201, 203, 207, 0.2)' : 'rgba(201, 203, 207, 1)');
  }


  handleChartClick(date: string, category: string, chartType: string): void {
    // console.log(`Clicked on ${chartType} chart! Date: ${date}, Product Category: ${category}`);
    this.openProductDetails(category,true);
  }

  // Method to handle clicking on the highest and the lowest selling product
  handleProductClick(event: MouseEvent, productCategory: string,iscurrentYear: boolean): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.openProductDetails(productCategory,iscurrentYear);
  }
   
  // Method to handle clicking on the top store value
  handleStoreClick(event: MouseEvent, storeName: string): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.openStoreDetails(storeName); // Open store details modal
  }

  openProductDetails(productCategory: string, iscurrentYear:boolean): void {
    // Fetch the product details based on the category
    console.log('Opening product details for:', productCategory);
    this.selectedProduct = this.getProductDetails(productCategory);
    this.showModal = true;

    // Set image based on product category
    this.selectedProduct.imageUrl = this.getProductImage(productCategory);
    if(iscurrentYear == true){
      let detailedData: { Stock_Sold: string, Sales: string }[] = [
        { Stock_Sold: this.highlightedItems[1].value, Sales: this.highlightedItems[0].value }
      ];
      this.productStockAndSales = detailedData;
    }
    else{
      let detailedData: { Stock_Sold: string, Sales: string }[] = [
        { Stock_Sold: this.PrevYrhighlightedItems[1].value, Sales: this.PrevYrhighlightedItems[0].value }
      ];
      this.productStockAndSales = detailedData;
    }
  }


  getProductImage(productCategory: string): string {
    const productImages: { [key: string]: string } = {
      'Gaming Console': 'assets/Gaming Consoles.jpg',
      'Guitar': 'assets/Guitars.jpg',
      'Clarinet': 'assets/Clarinets.jpg',
      // Add more categories as needed
    };
  
    return productImages[productCategory] || 'assets/images/default-product.jpg';
  }

  closeProductDetails(): void {
    console.log('Closing product details');
    this.showModal = false;
    this.selectedProduct = null;
    this.productStockAndSales=null;
  }

  private getProductDetails(productCategory: string): any {
    const products = {
      'Gaming Console': { name: 'Gaming Console', description: 'Experience the thrill of gaming with our powerful gaming console. Featuring cutting-edge technology, stunning graphics, and immersive gameplay, this console is perfect for gamers of all ages. Enjoy a wide range of popular games, from action-packed adventures to multiplayer experiences.', price: 30 },
      'Clarinet': { name: 'Clarinet', description: 'Discover the beauty and versatility of the clarinet. This classic woodwind instrument is ideal for both classical and jazz music. With its rich tone and expressive capabilities, the clarinet offers a rewarding musical experience for players of all levels.', price: 24 },
      'Guitar': { name: 'Guitar', description: 'Unleash your inner musician with our high-quality guitars. Crafted with precision and attention to detail, these instruments offer exceptional sound and playability. Whether you are a beginner or a seasoned guitarist, our guitars are designed to inspire and elevate your musical journey.', price: 30 }
    };
  
    return products[productCategory as keyof typeof products] || null;

  }

  // Open the store details modal
  openStoreDetails(storeName: string): void {
    console.log('Opening store details for:', storeName);
    this.selectedStore = this.getStoreDetails(storeName);
    this.showStoreModal = true;
  }

  // Get the store details based on the store name
  getStoreDetails(storeName: string): any {
    const stores = {
      'The Corner Store': {
        name: 'The Corner Store',
        description: 'Nestled in the heart of the community, The Corner Store offers a diverse range of products, including musical instruments like guitars and clarinets, as well as gaming consoles. Known for its friendly atmosphere and personalized service, this local favorite is a go-to destination for both seasoned musicians and casual gamers.',
        openTime: '8:00 AM - 8:00 PM',
        location: '123 Main Street, Springfield',
        manager: 'John Doe',
        imageUrl: 'assets/TheCornerStore.jpg'
      },
      'Market Basket': {
        name: 'Market Basket',
        description: 'As a major retailer, Market Basket provides a wide selection of products, including musical instruments and gaming consoles. With its convenient location and competitive prices, this store attracts customers from all walks of life. Whether you are a professional musician or a gaming enthusiast, Market Basket has something to offer.',
        openTime: '7:00 AM - 10:00 PM',
        location: '456 Market Road, Springfield',
        manager: 'Jane Smith',
        imageUrl: 'assets/MarketBasket.jpg'
      },
      'Main Street Mart': {
        name: 'Main Street Mart',
        description: 'Main Street Mart is a community-oriented store that prides itself on its commitment to supporting local businesses and musicians. In addition to guitars, gaming consoles, and clarinets, they carry a variety of other products and often host live music events and workshops.',
        openTime: '9:00 AM - 9:00 PM',
        location: '789 Main Street, Springfield',
        manager: 'Mike Johnson',
        imageUrl: 'assets/MainStreetMart.jpg'
      }
    };
    return stores[storeName as keyof typeof stores] || null;
  }

  // Close the store details modal
  closeStoreDetails(): void {
    console.log('Closing store details');
    this.showStoreModal = false;
    this.selectedStore = null;
  }
  onLogout(): void {
    localStorage.removeItem('isLoggedIn')
    this.router.navigate(['/login']);
  }
}
