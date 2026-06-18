import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  DepartmentService,
  Department,
  DepartmentResponse
} from '../../core/services/department.service';

@Component({
  selector: 'app-department',

  standalone: true,

  imports: [
    CommonModule,TranslateModule
  ],

  templateUrl: './department.component.html',

  styleUrls: ['./department.component.css']
})
export class DepartmentComponent
  implements OnInit {

  departments: Department[] = [];

  loading = false;

  errorMessage = '';

  constructor(
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {

    this.fetchDepartments();
  }

  fetchDepartments(): void {

    this.loading = true;

    this.errorMessage = '';

    this.departmentService
      .getDepartments()
      .subscribe({

        next: (
          res: DepartmentResponse
        ) => {

          this.ngZone.run(() => {

            this.departments = [
              ...res.content
            ];

            this.loading = false;

            this.cdr.detectChanges();

            console.log(
              'Departments Loaded:',
              this.departments
            );
          });
        },

        error: (err) => {

          this.ngZone.run(() => {

            this.errorMessage =

              err?.error?.message ||

              'Failed to load departments';

            this.loading = false;

            this.cdr.detectChanges();
          });
        }
      });
  }
}