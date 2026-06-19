import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateEmployeeComponent } from './create-employee.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeService } from '../../../core/services/employee.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';

describe('CreateEmployeeComponent', () => {
  let component: CreateEmployeeComponent;
  let fixture: ComponentFixture<CreateEmployeeComponent>;
  let mockEmployeeService: any;
  let mockRouter: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockEmployeeService = {
      getDepartments: () => of([]),
      getDesignations: () => of([])
    };

    mockRouter = {
      navigate: () => {}
    };

    mockToastService = {
      success: () => {},
      error: () => {},
      warning: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [
        CreateEmployeeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
