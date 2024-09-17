import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-details-modal',
  templateUrl: './product-details-modal.component.html',
  styleUrls: ['./product-details-modal.component.scss']
})
export class ProductDetailsModalComponent {
  @Input() product: any;
  @Input() stockAndSalesData: any; 
  @Output() close = new EventEmitter<void>();

  constructor() { }

  onClose(): void {
    this.close.emit();
  }
}