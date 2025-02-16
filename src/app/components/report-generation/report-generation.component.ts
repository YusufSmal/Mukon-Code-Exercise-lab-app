import { Component } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-report-generation',
  templateUrl: './report-generation.component.html',
  styleUrls: ['./report-generation.component.scss'],
})
export class ReportGenerationComponent {
  constructor(private localStorageService: LocalStorageService) {}

  downloadJSONReport() {
    this.localStorageService.generateJSONReport();
  }

  downloadTextReport() {
    this.localStorageService.generateTextReport();
  }
}
