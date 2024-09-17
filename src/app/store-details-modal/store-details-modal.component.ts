import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-store-details-modal',
  templateUrl: './store-details-modal.component.html',
  styleUrls: ['./store-details-modal.component.scss']
})
export class StoreDetailsModalComponent {
  @Input() store: any;
  @Input() stockAndSalesData: any; 
  @Output() close = new EventEmitter<void>();
//showStoreModal: any;

  onClose(): void {
    this.close.emit();
  }
}