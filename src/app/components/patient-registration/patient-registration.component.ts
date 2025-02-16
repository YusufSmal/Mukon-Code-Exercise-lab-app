import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';
import { TestService } from '../../services/test.service';

interface Test {
  TestId: number;
  Mnemonic: string;
  Description: string;
  IsActive: boolean;
}

interface Request {
  TestId: number;
  Result: string;
  Comment: string;
}

interface Requisition {
  RequisitionId: string;
  TimeSampleTaken: Date;
  FirstName: string;
  Surname: string;
  Gender: 'M' | 'F' | 'U';
  DateOfBirth: Date;
  Age: number;
  MobileNumber: string;
  RequestedTests: Request[];
}

@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.scss'],
})
export class PatientRegistrationComponent implements OnInit {
  tests: Test[] = [];
  selectedTests: number[] = [];
  registrationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private testService: TestService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.registrationForm = this.fb.group({
      requisitionId: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^\\+27[0-9]{9}$')]],
      selectedTests: [[], Validators.required]
    });
  }

  onTestSelection(event: any, testId: number) {
    const currentSelection = this.registrationForm.get('selectedTests')?.value || [];
    if (event.checked) {
      currentSelection.push(testId);
    } else {
      const index = currentSelection.indexOf(testId);
      if (index > -1) {
        currentSelection.splice(index, 1);
      }
    }
    this.registrationForm.patchValue({ selectedTests: currentSelection });
  }

  calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  ngOnInit() {
    this.testService.getTests().subscribe((tests: Test[]) => {
      this.tests = tests.filter(test => test.IsActive);
    });
  }

  savePatient() {
    if (this.registrationForm.valid) {
      const formValue = this.registrationForm.value;
      const age = this.calculateAge(formValue.dateOfBirth);

      // Create properly formatted requisition object
      const requisition: Requisition = {
        RequisitionId: formValue.requisitionId,
        TimeSampleTaken: new Date(),
        FirstName: formValue.firstName,
        Surname: formValue.surname,
        Gender: formValue.gender as 'M' | 'F' | 'U',
        DateOfBirth: new Date(formValue.dateOfBirth),
        Age: age,
        MobileNumber: formValue.mobileNumber,
        RequestedTests: formValue.selectedTests.map((testId: number) => ({
          TestId: testId,
          Result: '',
          Comment: ''
        }))
      };

      this.localStorageService.saveRequisition(requisition);
      alert('Patient registered successfully!');
      this.registrationForm.reset();
    }
  }
}
