import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
  selector: 'app-result-entry',
  templateUrl: './result-entry.component.html',
  styleUrls: ['./result-entry.component.scss'],
})
export class ResultEntryComponent implements OnInit {
  resultForm: FormGroup;
  requisitions: Requisition[] = [];
  selectedRequisition: Requisition | null = null;
  availableTests: Test[] = [];
  testResults: FormArray;

  constructor(
    private fb: FormBuilder, 
    private localStorageService: LocalStorageService,
    private testService: TestService
  ) {
    this.resultForm = this.fb.group({
      requisitionId: ['', Validators.required],
      testResults: this.fb.array([])
    });
    this.testResults = this.resultForm.get('testResults') as FormArray;
  }

  ngOnInit() {
    this.loadRequisitions();
    this.loadTests();
  }

  private loadRequisitions() {
    this.requisitions = this.localStorageService.getRequisitions();
    console.log('Loaded requisitions:', this.requisitions);
  }

  private loadTests() {
    this.testService.getTests().subscribe((tests: Test[]) => {
      this.availableTests = tests;
    });
  }

  onRequisitionSelect() {
    const selectedRequisitionId = this.resultForm.get('requisitionId')?.value;
    console.log('Selected requisition ID:', selectedRequisitionId);
    
    this.selectedRequisition = this.requisitions.find(r => r.RequisitionId === selectedRequisitionId) || null;
    console.log('Selected requisition:', this.selectedRequisition);
    
    if (this.selectedRequisition) {
      this.testResults.clear();
      
      // Create form controls for each requested test
      this.selectedRequisition.RequestedTests.forEach(request => {
        const test = this.availableTests.find(t => t.TestId === request.TestId);
        if (test) {
          this.testResults.push(this.fb.group({
            TestId: [request.TestId],
            Mnemonic: [test.Mnemonic],
            Description: [test.Description],
            Result: [request.Result || '', Validators.required],
            Comment: [request.Comment || '']
          }));
        }
      });
    }
  }

  getResultValidationMessage(testId: number, result: string): string | null {
    switch (testId) {
      case 1: // CBC
        if (isNaN(Number(result))) {
          return 'CBC result must be a number';
        }
        break;
      case 2: // CMP
        if (!/^\d+(\.\d{1,2})?$/.test(result)) {
          return 'CMP result must be a number with up to 2 decimal places';
        }
        break;
      case 3: // Lipid Panel
        if (!['Normal', 'Abnormal', 'Critical'].includes(result)) {
          return 'Lipid Panel result must be Normal, Abnormal, or Critical';
        }
        break;
    }
    return null;
  }

  saveResults() {
    if (this.resultForm.valid && this.selectedRequisition) {
      console.log('Saving results for requisition:', this.selectedRequisition.RequisitionId);
      
      // Validate all results
      const hasValidationErrors = this.testResults.controls.some(control => {
        const testId = control.get('TestId')?.value;
        const result = control.get('Result')?.value;
        const validationMessage = this.getResultValidationMessage(testId, result);
        if (validationMessage) {
          alert(validationMessage);
          return true;
        }
        return false;
      });

      if (!hasValidationErrors) {
        // Create a deep copy of the selected requisition
        const updatedRequisition: Requisition = {
          ...this.selectedRequisition,
          RequestedTests: this.testResults.controls.map(control => ({
            TestId: control.get('TestId')?.value,
            Result: control.get('Result')?.value,
            Comment: control.get('Comment')?.value
          }))
        };

        console.log('Updated requisition before save:', updatedRequisition);

        // Save the updated requisition
        this.localStorageService.saveRequisition(updatedRequisition);
        
        // Reload requisitions to get fresh data
        this.loadRequisitions();
        
        // Reset form
        this.resultForm.get('requisitionId')?.reset();
        this.testResults.clear();
        this.selectedRequisition = null;
        
        alert('Results saved successfully!');
      }
    } else {
      console.log('Form validation failed:', {
        formValid: this.resultForm.valid,
        selectedRequisition: !!this.selectedRequisition
      });
    }
  }
}
