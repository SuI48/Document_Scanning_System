import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentVersioningComponent } from './document-versioning.component';

describe('DocumentVersioningComponent', () => {
  let component: DocumentVersioningComponent;
  let fixture: ComponentFixture<DocumentVersioningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentVersioningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentVersioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
