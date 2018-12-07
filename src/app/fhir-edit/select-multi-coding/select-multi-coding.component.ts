import {Component, Input, OnInit} from '@angular/core';
import {Coding} from '../../models/stu3/fhir';
import {Globals} from '../../globals';
import {FhirService} from '../../services/fhir.service';

@Component({
    selector: 'app-fhir-select-multi-coding',
    templateUrl: './select-multi-coding.component.html',
    styleUrls: ['./select-multi-coding.component.css']
})
export class FhirSelectMultiCodingComponent implements OnInit {
    @Input() parentObject: any;
    @Input() propertyName: string;
    @Input() codes: Coding[];
    @Input() required: boolean;
    @Input() tooltipKey: string;
    @Input() tooltipPath: string;
    @Input() title: string;
    @Input() matchSystem = true;
    @Input() matchCode = true;
    public tooltip: string;

    constructor(
        public globals: Globals,
        private fhirService: FhirService) {
    }

    public getCodeType(code: Coding) {
        if (!this.codes || this.codes.length === 0) {
            return 'custom';
        }

        const foundOption = this.globals.getSelectCoding(code, this.codes, this.matchSystem, this.matchCode);

        if (foundOption) {
            return 'pre';
        }

        return 'custom';
    }

    public setCodeType(codeIndex, value) {
        if (!this.parentObject.hasOwnProperty(this.propertyName)) {
            return;
        }

        if (value === 'pre') {
            if (this.codes.length > 0) {
                this.parentObject[this.propertyName][codeIndex] = this.codes[0];
            }
        } else if (value === 'custom') {
            this.parentObject[this.propertyName][codeIndex] = {
                code: ''
            };
        }
    }

    public getCode(codeIndex) {
        const code = this.parentObject[this.propertyName][codeIndex];
        const foundOption = this.globals.getSelectCoding(code, this.codes, this.matchSystem, this.matchCode);

        if (foundOption) {
            return foundOption;
        }
    }

    public setCode(codeIndex, value) {
        const code = this.parentObject[this.propertyName][codeIndex];
        Object.assign(code, value);
    }

    ngOnInit() {
        if (this.tooltipKey) {
            this.tooltip = this.globals.tooltips[this.tooltipKey];
        } else if (this.tooltipPath) {
            this.tooltip = this.fhirService.getFhirTooltip(this.tooltipPath);
        }
    }
}
