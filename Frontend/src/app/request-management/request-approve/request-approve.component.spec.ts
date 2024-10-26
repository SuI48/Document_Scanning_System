import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApproveComponent } from './request-approve.component';

describe('RequestApproveComponent', () => {
  let component: RequestApproveComponent;
  let fixture: ComponentFixture<RequestApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestApproveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
