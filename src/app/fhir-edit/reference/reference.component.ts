import {Component, Input, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Globals} from '../../globals';
import {ResourceReference} from '../../models/stu3/fhir';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {FhirEditReferenceModalComponent} from '../reference-modal/reference-modal.component';

@Component({
    selector: 'app-fhir-reference',
    templateUrl: './reference.component.html',
    styleUrls: ['./reference.component.css']
})
export class ReferenceComponent implements OnInit {
    @Input() public parentObject: any;
    @Input() public propertyName: string;
    @Input() public isFormGroup = true;
    @Input() public title: string;
    @Input() public resourceType?: string;
    @Input() public required: boolean;
    @Input() public hideResourceType?: boolean;
    @Input() public disabled: boolean;

    constructor(
        private modalService: NgbModal,
        public globals: Globals) {
    }
    
    get reference(): string {
        if (this.parentObject[this.propertyName]) {
            return this.parentObject[this.propertyName].reference;
        }
        return '';
    }
    
    set reference(value: string) {
        if (!this.parentObject[this.propertyName]) {
            return;
        }
        
        this.parentObject[this.propertyName].reference = value;
    }

    get display(): string {
        if (this.parentObject[this.propertyName]) {
            return this.parentObject[this.propertyName].display;
        }
        return '';
    }

    set display(value: string) {
        if (!this.parentObject[this.propertyName]) {
            return;
        }

        this.parentObject[this.propertyName].display = value;
    }

    open(content) {
        const modalRef = this.modalService.open(FhirEditReferenceModalComponent, { size: 'lg' });
        modalRef.componentInstance.resourceType = this.resourceType;
        modalRef.componentInstance.hideResourceType = this.hideResourceType;

        modalRef.result.then((results: any) => {
            const reference: ResourceReference = this.parentObject[this.propertyName];
            reference.reference = results.resourceType + '/' + results.id;
            reference.display = results.display;
        });
    }

    ngOnInit() {
    }
}
