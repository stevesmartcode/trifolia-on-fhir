import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StructureDefinitionComponent} from './structure-definition.component';
import {BrowserModule} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {ConfigService} from '../services/config.service';
import {StructureDefinitionService} from '../services/structure-definition.service';
import {Globals} from '../globals';
import {RecentItemService} from '../services/recent-item.service';
import {FhirService} from '../services/fhir.service';
import {FileService} from '../services/file.service';
import {CookieService} from 'angular2-cookie/core';
import {FhirStringComponent} from '../fhir-edit/string/string.component';
import {ImplementationGuidesPanelComponent} from './implementation-guides-panel/implementation-guides-panel.component';
import {FhirSelectSingleCodeComponent} from '../fhir-edit/select-single-code/select-single-code.component';
import {FhirBooleanComponent} from '../fhir-edit/boolean/boolean.component';
import {FhirDateComponent} from '../fhir-edit/date/date.component';
import {FhirMarkdownComponent} from '../fhir-edit/markdown/markdown.component';
import {MarkdownComponent} from '../markdown/markdown.component';
import {FhirMultiIdentifierComponent} from '../fhir-edit/multi-identifier/multi-identifier.component';
import {FhirMultiUseContextComponent} from '../fhir-edit/multi-use-context/multi-use-context.component';
import {FhirMultiJurisdictionComponent} from '../fhir-edit/multi-jurisdiction/multi-jurisdiction.component';
import {FhirMultiContactComponent} from '../fhir-edit/multi-contact/multi-contact.component';
import {FhirSelectMultiCodingComponent} from '../fhir-edit/select-multi-coding/select-multi-coding.component';
import {TooltipIconComponent} from '../tooltip-icon/tooltip-icon.component';
import {ValidationResultsComponent} from '../validation-results/validation-results.component';
import {RawResourceComponent} from '../raw-resource/raw-resource.component';
import {ElementDefinitionPanelComponent} from './element-definition-panel/element-definition-panel.component';
import {FhirXmlPipe} from '../pipes/fhir-xml-pipe';
import {FhirReferenceComponent} from '../fhir-edit/reference/reference.component';
import {FhirChoiceComponent} from '../fhir-edit/choice/choice.component';
import {FhirIdentifierComponent} from '../fhir-edit/identifier/identifier.component';
import {FhirAttachmentComponent} from '../fhir-edit/attachment/attachment.component';
import {FhirQuantityComponent} from '../fhir-edit/quantity/quantity.component';
import {FhirHumanNameComponent} from '../fhir-edit/human-name/human-name.component';
import {FhirPeriodComponent} from '../fhir-edit/period/period.component';
import {FhirRatioComponent} from '../fhir-edit/ratio/ratio.component';
import {FhirRangeComponent} from '../fhir-edit/range/range.component';
import {ContextPanelWrapperComponent} from './context-panel-wrapper/context-panel-wrapper.component';

describe('StructureDefinitionComponent', () => {
    let component: StructureDefinitionComponent;
    let fixture: ComponentFixture<StructureDefinitionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StructureDefinitionComponent,
                FhirStringComponent,
                ImplementationGuidesPanelComponent,
                FhirSelectSingleCodeComponent,
                FhirBooleanComponent,
                FhirDateComponent,
                FhirMarkdownComponent,
                MarkdownComponent,
                FhirMultiIdentifierComponent,
                FhirMultiUseContextComponent,
                FhirMultiJurisdictionComponent,
                FhirMultiContactComponent,
                FhirSelectMultiCodingComponent,
                TooltipIconComponent,
                ValidationResultsComponent,
                RawResourceComponent,
                ElementDefinitionPanelComponent,
                FhirXmlPipe,
                FhirReferenceComponent,
                FhirChoiceComponent,
                FhirIdentifierComponent,
                FhirAttachmentComponent,
                FhirQuantityComponent,
                FhirHumanNameComponent,
                FhirPeriodComponent,
                FhirRatioComponent,
                FhirRangeComponent,
                ContextPanelWrapperComponent
            ],
            imports: [
                BrowserModule,
                RouterTestingModule,
                HttpClientModule,
                NgbModule.forRoot(),
                FormsModule
            ],
            providers: [
                ConfigService,
                StructureDefinitionService,
                Globals,
                RecentItemService,
                FhirService,
                FileService,
                CookieService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StructureDefinitionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
