import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {R4ImplementationGuideComponent} from './implementation-guide.component';
import {BrowserModule} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {ImplementationGuideService} from '../../shared/implementation-guide.service';
import {AuthService} from '../../shared/auth.service';
import {ConfigService} from '../../shared/config.service';
import {RecentItemService} from '../../shared/recent-item.service';
import {FileService} from '../../shared/file.service';
import {FhirService} from '../../shared/fhir.service';
import {FhirStringComponent} from '../../fhir-edit/string/string.component';
import {FhirMarkdownComponent} from '../../fhir-edit/markdown/markdown.component';
import {MarkdownComponent} from '../../markdown/markdown.component';
import {TooltipIconComponent} from '../../tooltip-icon/tooltip-icon.component';
import {FhirReferenceComponent} from '../../fhir-edit/reference/reference.component';
import {FhirBooleanComponent} from '../../fhir-edit/boolean/boolean.component';
import {FhirSelectSingleCodeComponent} from '../../fhir-edit/select-single-code/select-single-code.component';
import {FhirMultiContactComponent} from '../../fhir-edit/multi-contact/multi-contact.component';
import {ValidationResultsComponent} from '../../validation-results/validation-results.component';
import {RawResourceComponent} from '../../raw-resource/raw-resource.component';
import {FhirXmlPipe} from '../../pipes/fhir-xml-pipe';
import {PractitionerService} from '../../shared/practitioner.service';
import {CookieService} from 'angular2-cookie/core';
import {ResourceHistoryComponent} from '../../resource-history/resource-history.component';
import {AngularEditorModule} from '@kolkov/angular-editor';
import {DiffMatchPatchModule} from 'ng-diff-match-patch';
import {NarrativeComponent} from '../../fhir-edit/narrative/narrative.component';

describe('R4ImplementationGuideComponent', () => {
    let component: R4ImplementationGuideComponent;
    let fixture: ComponentFixture<R4ImplementationGuideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                R4ImplementationGuideComponent,
                FhirStringComponent,
                FhirMarkdownComponent,
                MarkdownComponent,
                TooltipIconComponent,
                FhirReferenceComponent,
                FhirBooleanComponent,
                FhirSelectSingleCodeComponent,
                FhirMultiContactComponent,
                ValidationResultsComponent,
                RawResourceComponent,
                FhirXmlPipe,
                ResourceHistoryComponent,
                NarrativeComponent
            ],
            imports: [
                DiffMatchPatchModule,
                AngularEditorModule,
                BrowserModule,
                RouterTestingModule,
                HttpClientModule,
                NgbModule.forRoot(),
                FormsModule
            ],
            providers: [
                ImplementationGuideService,
                AuthService,
                ConfigService,
                RecentItemService,
                FileService,
                FhirService,
                PractitionerService,
                CookieService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(R4ImplementationGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
