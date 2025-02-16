import { Component, OnInit } from '@angular/core';
import { TestService } from '../../services/test.service';

interface Test {
  TestId: number;
  Mnemonic: string;
  Description: string;
  IsActive: boolean;
}

@Component({
  selector: 'app-test-selection',
  templateUrl: './test-selection.component.html',
  styleUrls: ['./test-selection.component.scss'],
})
export class TestSelectionComponent implements OnInit {
  tests: Test[] = [];
  selectedTests: number[] = [];
  displayedColumns: string[] = ['TestId', 'Mnemonic', 'Description', 'actions'];

  constructor(private testService: TestService) {}

  validateTestSelection(): boolean {
    const invalidCombinations = [
      { tests: [1, 2, 3, 5], invalidTest: 6 },
    ];

    for (const combo of invalidCombinations) {
      const hasAllTests = combo.tests.every(test => this.selectedTests.includes(test));
      if (hasAllTests && this.selectedTests.includes(combo.invalidTest)) {
        alert(`Tests ${combo.tests.join(', ')} cannot be requested with Test ${combo.invalidTest}.`);
        return false;
      }
    }
    return true;
  }

  ngOnInit(): void {
    this.testService.getTests().subscribe((data: Test[]) => {
      this.tests = data.filter(test => test.IsActive);
    });
  }

  onTestSelectionChange(selectedTestId: number): void {
    const index = this.selectedTests.indexOf(selectedTestId);
    if (index > -1) {
      this.selectedTests.splice(index, 1);
    } else {
      this.selectedTests.push(selectedTestId);
    }
  }

  isTestSelected(testId: number): boolean {
    return this.selectedTests.includes(testId);
  }

  submitSelection(): void {
    if (this.validateTestSelection()) {
      alert('Tests selected successfully!');
    }
  }
}
