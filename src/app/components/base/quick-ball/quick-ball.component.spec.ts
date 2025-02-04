import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBallComponent } from './quick-ball.component';

describe('QuickBallComponent', () => {
  let component: QuickBallComponent;
  let fixture: ComponentFixture<QuickBallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
