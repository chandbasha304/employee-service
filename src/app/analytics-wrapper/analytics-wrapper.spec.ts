import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsWrapperComponent } from './analytics-wrapper.component';

describe('AnalyticsWrapperComponent', () => {
  let component: AnalyticsWrapperComponent;
  let fixture: ComponentFixture<AnalyticsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsWrapperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
