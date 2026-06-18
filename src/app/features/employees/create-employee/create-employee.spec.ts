import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmployee } from './create-employee';

describe('CreateEmployee', () => {
  let component: CreateEmployee;
  let fixture: ComponentFixture<CreateEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEmployee],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEmployee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
