import {Component, OnInit, ViewChild} from '@angular/core';
import {ImplementationGuideService} from '../shared/implementation-guide.service';
import {saveAs} from 'file-saver';
import {ExportOptions, ExportService} from '../shared/export.service';
import {ExportFormats} from '../models/export-formats.enum';
import {SocketService} from '../shared/socket.service';
import {Globals} from '../../../../../libs/tof-lib/src/lib/globals';
import {CookieService} from 'angular2-cookie/core';
import {ConfigService} from '../shared/config.service';
import {Bundle, DomainResource, ImplementationGuide} from '../../../../../libs/tof-lib/src/lib/stu3/fhir';
import {FileModel, GithubService} from '../shared/github.service';
import {FhirService} from '../shared/fhir.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {AuthService} from '../shared/auth.service';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {getErrorString, getStringFromBlob} from '../../../../../libs/tof-lib/src/lib/helper';
import {ExportGithubComponent} from './github/export-github.component';

@Component({
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {
  public message: string;
  public socketOutput = '';
  private packageId;
  public searching = false;
  public activeTabId = 'html';
  public Globals = Globals;

  public options = new ExportOptions();
  public selectedImplementationGuide: ImplementationGuide;

  @ViewChild('github', { static: false }) exportGithubComponent: ExportGithubComponent;

  constructor(
    private authService: AuthService,
    private implementationGuideService: ImplementationGuideService,
    private socketService: SocketService,
    private exportService: ExportService,
    private cookieService: CookieService,
    private githubService: GithubService,
    private fhirService: FhirService,
    private configService: ConfigService) {

    this.options.implementationGuideId = this.cookieService.get(Globals.cookieKeys.exportLastImplementationGuideId + '_' + this.configService.fhirServer);
    this.options.responseFormat = <any>this.cookieService.get(Globals.cookieKeys.lastResponseFormat) || 'application/json';
    this.options.downloadOutput = true;
  }

  public onTabChange(event: NgbTabChangeEvent) {
    this.activeTabId = event.nextId;

    switch (this.activeTabId) {
      case 'html':
        this.options.exportFormat = ExportFormats.HTML;
        break;
      case 'bundle':
        this.options.exportFormat = ExportFormats.Bundle;
        break;
      case 'github':
        this.options.exportFormat = ExportFormats.GitHub;
        break;
      default:
        throw new Error('Unexpected tab selected. Cannot set export format.');
    }
  }

  public implementationGuideChanged(implementationGuide: ImplementationGuide) {
    this.selectedImplementationGuide = implementationGuide;
    this.options.implementationGuideId = implementationGuide ? implementationGuide.id : undefined;

    const cookieKey = Globals.cookieKeys.exportLastImplementationGuideId + '_' + this.configService.fhirServer;

    if (implementationGuide && implementationGuide.id) {
      this.cookieService.put(cookieKey, implementationGuide.id);
    } else if (this.cookieService.get(cookieKey)) {
      this.cookieService.remove(cookieKey);
    }
  }

  public searchImplementationGuide = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap((term) => {
        return this.implementationGuideService.getImplementationGuides(1, term).pipe(
          map((bundle) => {
            return (bundle.entry || []).map((entry) => <ImplementationGuide> entry.resource);
          })
        );
      }),
      tap(() => this.searching = false)
    );
  }

  public searchFormatter = (ig: ImplementationGuide) => {
    return `${ig.name} (id: ${ig.id})`;
  }

  public clearImplementationGuide() {
    const cookieKey = Globals.cookieKeys.exportLastImplementationGuideId + '_' + this.configService.fhirServer;

    this.selectedImplementationGuide =
      this.options.implementationGuideId = null;

    if (this.cookieService.get(cookieKey)) {
      this.cookieService.remove(cookieKey);
    }
  }

  public responseFormatChanged() {
    this.cookieService.put(Globals.cookieKeys.lastResponseFormat, this.options.responseFormat);
  }

  public get exportDisabled(): boolean {
    if (!this.options.implementationGuideId || !this.options.exportFormat) {
      return true;
    }

    if (this.options.exportFormat === ExportFormats.GitHub) {
      if (!this.exportGithubComponent) {
        return true;
      }

      return this.exportGithubComponent.exportDisabled;
    }

    return !this.options.responseFormat;
  }

  public export() {
    this.socketOutput = '';
    this.message = 'Exporting...';

    this.cookieService.put(Globals.cookieKeys.exportLastImplementationGuideId + '_' + this.configService.fhirServer, this.options.implementationGuideId);

    const igName = this.selectedImplementationGuide.name.replace(/\s/g, '_');
    const extension = (this.options.responseFormat === 'application/xml' ? '.xml' : '.json');

    try {
      switch (this.options.exportFormat) {
        case ExportFormats.HTML:
          this.exportService.exportHtml(this.options)
            .subscribe((response) => {
              saveAs(response.body, igName + '.zip');
              this.message = 'Done exporting.';
            }, (err) => {
              this.message = getErrorString(err);
            });
          break;
        case ExportFormats.Bundle:
          this.exportService.exportBundle(this.options)
            .subscribe((response) => {
              saveAs(response.body, igName + extension);
              this.message = 'Done exporting.';
            }, (err) => {
              this.message = getErrorString(err);
            });
          break;
        case ExportFormats.GitHub:
          this.exportGithubComponent.export()
            .then((results) => {
              this.message = results.message;
            })
            .catch((err) => {
              this.message = err.message;
            });
          break;
      }
    } catch (ex) {
      this.message = ex.message;
    }
  }

  ngOnInit() {
    if (this.options.implementationGuideId) {
      this.implementationGuideService.getImplementationGuide(this.options.implementationGuideId)
        .subscribe((implementationGuide: ImplementationGuide) => {
          this.selectedImplementationGuide = implementationGuide;
        }, (err) => this.message = getErrorString(err));
    }
  }
}
