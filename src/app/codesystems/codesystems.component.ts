import {Component, OnInit} from '@angular/core';
import {CodeSystemService} from '../services/code-system.service';
import {Bundle, CodeSystem} from '../models/stu3/fhir';
import * as _ from 'underscore';
import {ChangeResourceIdModalComponent} from '../change-resource-id-modal/change-resource-id-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '../services/config.service';
import {Subject} from 'rxjs';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'app-codesystems',
    templateUrl: './codesystems.component.html',
    styleUrls: ['./codesystems.component.css']
})
export class CodesystemsComponent implements OnInit {
    public codeSystemsBundle: Bundle;
    public nameText: string;
    public page = 1;
    public criteriaChangedEvent = new Subject();

    constructor(
        private configService: ConfigService,
        private codeSystemService: CodeSystemService,
        private modalService: NgbModal) {

        this.criteriaChangedEvent
            .debounceTime(500)
            .subscribe(() => {
                this.getCodeSystems();
            });
    }

    public get codeSystems(): CodeSystem[] {
        if (!this.codeSystemsBundle) {
            return [];
        }

        return _.map(this.codeSystemsBundle.entry, (entry) => <CodeSystem> entry.resource);
    }

    public nameTextChanged(value: string) {
        this.nameText = value;
        this.page = 1;
        this.criteriaChangedEvent.next();
    }

    public clearFilters() {
        this.nameText = null;
        this.page = 1;
        this.criteriaChangedEvent.next();
    }

    public remove(codeSystem: CodeSystem) {
        if (!confirm(`Are you sure you want to delete the code system ${codeSystem.title || codeSystem.name || codeSystem.id}`)) {
            return;
        }

        this.codeSystemService.delete(codeSystem.id)
            .subscribe(() => {
                const index = this.codeSystems.indexOf(codeSystem);
                this.codeSystems.splice(index, 1);
            }, (err) => {
                this.configService.handleError(err, 'An error occurred while deleting the code system');
            });
    }

    public changeId(codeSystem: CodeSystem) {
        const modalRef = this.modalService.open(ChangeResourceIdModalComponent);
        modalRef.componentInstance.resourceType = codeSystem.resourceType;
        modalRef.componentInstance.originalId = codeSystem.id;
        modalRef.result.then((newId) => {
            codeSystem.id = newId;
        });
    }

    public getCodeSystems() {
        this.codeSystemService.search(this.page, this.nameText)
            .subscribe((results) => {
                this.codeSystemsBundle = results;
            }, (err) => {
                this.configService.handleError(err, 'An error occurred while searching for code systems');
            });
    }

    ngOnInit() {
        this.getCodeSystems();
    }
}
