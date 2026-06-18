export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  departmentName: string;
  salary: number;
  selected?: boolean; // UI-only property for bulk actions
}
