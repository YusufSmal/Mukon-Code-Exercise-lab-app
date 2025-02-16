import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly storageKey = 'requisitions';

  saveRequisition(requisition: Requisition): void {
    console.log('Saving requisition:', requisition);

    // Validate requisition data
    if (!requisition.RequisitionId.match(/^[0-9]{4}$/)) {
      alert('Requisition ID must be a 4-digit number.');
      return;
    }
    if (!['M', 'F', 'U'].includes(requisition.Gender)) {
      alert('Gender must be M, F, or U.');
      return;
    }
    if (new Date(requisition.DateOfBirth) >= new Date(requisition.TimeSampleTaken)) {
      alert('Date of Birth cannot be after the sample time.');
      return;
    }
    if (!requisition.MobileNumber.match(/^\+27[0-9]{9}$/)) {
      alert('Mobile number must be in the format +27XXXXXXXXX.');
      return;
    }

    let requisitions = this.getRequisitions();
    console.log('Current requisitions:', requisitions);

    // Find existing requisition
    const index = requisitions.findIndex((r) => r.RequisitionId === requisition.RequisitionId);

    if (index !== -1) {
      // Update existing requisition while preserving test results
      const existingRequisition = requisitions[index];
      requisitions[index] = {
        ...requisition,
        RequestedTests: requisition.RequestedTests.map(newTest => {
          // Try to find existing test result
          const existingTest = existingRequisition.RequestedTests.find(
            test => test.TestId === newTest.TestId
          );
          // Use new test data, but preserve existing result and comment if new ones are empty
          return {
            ...newTest,
            Result: newTest.Result || existingTest?.Result || '',
            Comment: newTest.Comment || existingTest?.Comment || ''
          };
        })
      };
    } else {
      // Add new requisition
      requisitions.push({
        ...requisition,
        RequestedTests: requisition.RequestedTests.map(test => ({
          ...test,
          Result: test.Result || '',
          Comment: test.Comment || ''
        }))
      });
    }

    // Ensure dates are properly serialized
    const requisitionsToSave = requisitions.map(req => ({
      ...req,
      TimeSampleTaken: new Date(req.TimeSampleTaken).toISOString(),
      DateOfBirth: new Date(req.DateOfBirth).toISOString()
    }));

    console.log('Saving requisitions:', requisitionsToSave);
    localStorage.setItem(this.storageKey, JSON.stringify(requisitionsToSave));
  }

  getRequisitions(): Requisition[] {
    const data = localStorage.getItem(this.storageKey);
    console.log('Raw storage data:', data);

    if (!data) {
      console.log('No requisitions found in storage');
      return [];
    }

    try {
      const requisitions = JSON.parse(data);
      console.log('Parsed requisitions:', requisitions);

      // Convert string dates back to Date objects and ensure RequestedTests is initialized
      const formattedRequisitions = requisitions.map((req: any) => ({
        ...req,
        TimeSampleTaken: new Date(req.TimeSampleTaken),
        DateOfBirth: new Date(req.DateOfBirth),
        RequestedTests: req.RequestedTests || []
      }));

      console.log('Formatted requisitions:', formattedRequisitions);
      return formattedRequisitions;
    } catch (error) {
      console.error('Error parsing requisitions:', error);
      return [];
    }
  }

  generateJSONReport(): void {
    const requisitions = this.getRequisitions();
    if (requisitions.length === 0) {
      alert('No data available!');
      return;
    }

    const blob = new Blob([JSON.stringify(requisitions, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab-report.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateTextReport(): void {
    const requisitions = this.getRequisitions();
    if (requisitions.length === 0) {
      alert('No data available!');
      return;
    }

    let report = 'Lab Report\n========================\n';
    requisitions.forEach((req) => {
      report += `Requisition ID: ${req.RequisitionId}\n`;
      report += `Patient: ${req.FirstName} ${req.Surname}\n`;
      report += `Gender: ${req.Gender} | DOB: ${req.DateOfBirth.toLocaleDateString()} | Phone: ${req.MobileNumber}\n`;
      report += `Tests:\n`;

      if (req.RequestedTests && req.RequestedTests.length > 0) {
        req.RequestedTests.forEach((test) => {
          report += `  - Test ID: ${test.TestId} | Result: ${test.Result || 'Pending'} | Comment: ${test.Comment || 'None'}\n`;
        });
      } else {
        report += `  No tests recorded.\n`;
      }

      report += `-------------------------\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearStorage(): void {
    localStorage.removeItem(this.storageKey);
    console.log('Storage cleared');
  }
}
