import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientRegistrationComponent } from './components/patient-registration/patient-registration.component';
import { TestSelectionComponent } from './components/test-selection/test-selection.component';
import { ResultEntryComponent } from './components/result-entry/result-entry.component';
import { ReportGenerationComponent } from './components/report-generation/report-generation.component';

const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: PatientRegistrationComponent },
  { path: 'tests', component: TestSelectionComponent },
  { path: 'results', component: ResultEntryComponent },
  { path: 'report', component: ReportGenerationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
