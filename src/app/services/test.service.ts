import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface Test {
  TestId: number;
  Mnemonic: string;
  Description: string;
  IsActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private readonly TESTS_KEY = 'lab_tests';
  private defaultTests: Test[] = [
    {
      TestId: 1,
      Mnemonic: 'CBC',
      Description: 'Complete Blood Count',
      IsActive: true
    },
    {
      TestId: 2,
      Mnemonic: 'CMP',
      Description: 'Comprehensive Metabolic Panel',
      IsActive: true
    },
    {
      TestId: 3,
      Mnemonic: 'LIPID',
      Description: 'Lipid Panel',
      IsActive: true
    },
    {
      TestId: 4,
      Mnemonic: 'TSH',
      Description: 'Thyroid Stimulating Hormone',
      IsActive: true
    },
    {
      TestId: 5,
      Mnemonic: 'A1C',
      Description: 'Hemoglobin A1C',
      IsActive: true
    }
  ];

  constructor() {
    this.initializeTests();
  }

  private initializeTests(): void {
    if (!localStorage.getItem(this.TESTS_KEY)) {
      localStorage.setItem(this.TESTS_KEY, JSON.stringify(this.defaultTests));
    }
  }

  getTests(): Observable<Test[]> {
    const tests = localStorage.getItem(this.TESTS_KEY);
    return of(tests ? JSON.parse(tests) : []);
  }

  updateTest(test: Test): Observable<Test[]> {
    const tests = this.getAllTests();
    const index = tests.findIndex(t => t.TestId === test.TestId);
    if (index !== -1) {
      tests[index] = test;
      this.saveTests(tests);
    }
    return of(tests);
  }

  private getAllTests(): Test[] {
    const tests = localStorage.getItem(this.TESTS_KEY);
    return tests ? JSON.parse(tests) : [];
  }

  private saveTests(tests: Test[]): void {
    localStorage.setItem(this.TESTS_KEY, JSON.stringify(tests));
  }
}
