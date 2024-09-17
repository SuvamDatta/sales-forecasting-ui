import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetailsModalComponent } from './store-details-modal.component';

describe('StoreDetailsModalComponent', () => {
  let component: StoreDetailsModalComponent;
  let fixture: ComponentFixture<StoreDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StoreDetailsModalComponent]
    });
    fixture = TestBed.createComponent(StoreDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
