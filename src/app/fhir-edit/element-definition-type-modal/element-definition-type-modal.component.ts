import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Globals} from '../../globals';
import {FhirService} from '../../services/fhir.service';
import {Coding, TypeRefComponent} from '../../models/stu3/fhir';
import {FhirReferenceModalComponent} from '../reference-modal/reference-modal.component';

@Component({
    selector: 'app-fhir-element-definition-type-modal',
    templateUrl: './element-definition-type-modal.component.html',
    styleUrls: ['./element-definition-type-modal.component.css']
})
export class FhirElementDefinitionTypeModalComponent implements OnInit {
    @Input() element: any;
    @Input() type: TypeRefComponent;
    public definedTypeCodes: Coding[] = [];

    constructor(
        public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        private fhirService: FhirService,
        public globals: Globals) {
    }

    selectProfile(dest: string) {
        const modalRef = this.modalService.open(FhirReferenceModalComponent, { size: 'lg' });
        modalRef.componentInstance.resourceType = 'StructureDefinition';
        modalRef.componentInstance.hideResourceType = true;

        modalRef.result.then((results) => {
            this.type[dest] = results.resource.url;
        });
    }

    ngOnInit() {
        this.definedTypeCodes = this.fhirService.getValueSetCodes('http://hl7.org/fhir/ValueSet/defined-types');
    }
}
