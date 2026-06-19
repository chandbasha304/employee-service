import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentComponent } from './department.component';
import { TranslateModule } from '@ngx-translate/core';
import { DepartmentService } from '../../core/services/department.service';
import { of } from 'rxjs';

describe('DepartmentComponent', () => {
  let component: DepartmentComponent;
  let fixture: ComponentFixture<DepartmentComponent>;
  let mockDepartmentService: any;

  beforeEach(async () => {
    mockDepartmentService = {
      getDepartments: () => of({ content: [] })
    };

    await TestBed.configureTestingModule({
      imports: [
        DepartmentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DepartmentService, useValue: mockDepartmentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
