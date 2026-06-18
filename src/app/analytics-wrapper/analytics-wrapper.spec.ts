import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsWrapper } from './analytics-wrapper';

describe('AnalyticsWrapper', () => {
  let component: AnalyticsWrapper;
  let fixture: ComponentFixture<AnalyticsWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
