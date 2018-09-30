import {Component, DoCheck, Input, OnDestroy, OnInit} from '@angular/core';
import {
    OperationOutcome,
    Questionnaire,
    QuestionnaireItemComponent
} from '../models/stu3/fhir';
import {Globals} from '../globals';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecentItemService} from '../services/recent-item.service';
import {FileService} from '../services/file.service';
import {FhirService} from '../services/fhir.service';
import {QuestionnaireService} from '../services/questionnaire.service';
import {ConfigService} from '../services/config.service';
import * as _ from 'underscore';
import {FhirEditQuestionnaireItemModalComponent} from '../fhir-edit/questionnaire-item-modal/questionnaire-item-modal.component';

export class ItemModel {
    public item: QuestionnaireItemComponent;
    public expanded = false;
    public level = 1;
    public parent?: ItemModel;

    constructor(parent?: ItemModel, item?: QuestionnaireItemComponent, level?: number) {
        this.parent = parent;
        this.item = item;
        this.level = level || 1;
    }

    public getSpaces() {
        let spaces = '';

        for (let i = 1; i < this.level; i++) {
            spaces += '    ';
        }

        return spaces;
    }

    public hasChildren(): boolean {
        return this.item.item && this.item.item.length > 0;
    }
}

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit, OnDestroy, DoCheck {
    @Input() public questionnaire = new Questionnaire();
    public message: string;
    public validation: any;
    private navSubscription: any;
    public flattenedItems: ItemModel[];

    constructor(
        public globals: Globals,
        private questionnaireService: QuestionnaireService,
        private route: ActivatedRoute,
        private router: Router,
        private configService: ConfigService,
        private modalService: NgbModal,
        private recentItemService: RecentItemService,
        private fileService: FileService,
        private fhirService: FhirService) {
    }

    public get isNew(): boolean {
        const id  = this.route.snapshot.paramMap.get('id');
        return !id || id === 'new';
    }

    public revert() {
        this.getQuestionnaire();
    }

    public save() {
        const questionnaireId = this.route.snapshot.paramMap.get('id');

        if (!this.validation.valid && !confirm('This questionnaire is not valid, are you sure you want to save?')) {
            return;
        }

        if (questionnaireId === 'from-file') {
            this.fileService.saveFile();
            return;
        }

        this.questionnaireService.save(this.questionnaire)
            .subscribe((results: Questionnaire) => {
                if (!this.questionnaire.id) {
                    this.router.navigate(['/questionnaire/' + results.id]);
                } else {
                    this.recentItemService.ensureRecentItem(
                        this.globals.cookieKeys.recentQuestionnaires,
                        results.id,
                        results.name || results.title);
                    this.message = 'Successfully saved questionnaire!';
                    setTimeout(() => { this.message = ''; }, 3000);
                }
            }, (err) => {
                this.message = 'An error occured while saving the questionnaire';
            });
    }

    private getQuestionnaire() {
        const questionnaireId  = this.route.snapshot.paramMap.get('id');

        if (questionnaireId === 'from-file') {
            if (this.fileService.file) {
                this.questionnaire = <Questionnaire> this.fileService.file.resource;
                this.nameChanged();
            } else {
                this.router.navigate(['/']);
                return;
            }
        }

        if (questionnaireId !== 'new' && questionnaireId) {
            this.questionnaire = null;

            this.questionnaireService.get(questionnaireId)
                .subscribe((questionnaire: Questionnaire | OperationOutcome) => {
                    if (questionnaire.resourceType !== 'Questionnaire') {
                        this.message = 'The specified questionnaire either does not exist or was deleted';
                        return;
                    }

                    this.questionnaire = <Questionnaire> questionnaire;
                    this.nameChanged();
                    this.initFlattenedItems();

                    this.recentItemService.ensureRecentItem(
                        this.globals.cookieKeys.recentQuestionnaires,
                        questionnaire.id,
                        this.questionnaire.name || this.questionnaire.title);
                }, (err) => {
                    this.message = err && err.message ? err.message : 'Error loading questionnaire';
                    this.recentItemService.removeRecentItem(this.globals.cookieKeys.recentQuestionnaires, questionnaireId);
                });
        }
    }

    private initFlattenedItems() {
        this.flattenedItems = _.map(this.questionnaire.item, (item) => {
            const newItemModel = new ItemModel();
            newItemModel.item = item;
            newItemModel.level = 1;
            return newItemModel;
        });
    }

    public toggleItems() {
        const newItems = [{
            linkId: Math.floor(1000 + Math.random() * 9000).toString()
        }];
        this.globals.toggleProperty(this.questionnaire, 'item', newItems, () => {
            this.initFlattenedItems();
        });
    }

    public editItem(itemModel: ItemModel) {
        const modalRef = this.modalService.open(FhirEditQuestionnaireItemModalComponent, { size: 'lg' });
        modalRef.componentInstance.item = itemModel.item;
    }

    public addItem(parent?: ItemModel) {
        if (parent && !parent.expanded) {       // Make sure the parent is expanded before adding the new child
            this.toggleExpandItem(parent);
        }

        const newItem = {
            linkId: Math.floor(1000 + Math.random() * 9000).toString()
        };

        if (parent) {
            if (!parent.item.item) {
                parent.item.item = [];
            }

            const childItemModels = _.filter(this.flattenedItems, (itemModel) => itemModel.parent === parent);
            let lastIndex = this.flattenedItems.indexOf(parent);

            if (childItemModels.length > 0) {
                lastIndex = this.flattenedItems.indexOf(childItemModels[childItemModels.length - 1]);
            }

            parent.item.item.push(newItem);
            this.flattenedItems.splice(lastIndex + 1, 0, new ItemModel(parent, newItem, parent.level + 1));

            if (!parent.item.type) {
                parent.item.type = 'group';
            }
        } else {
            this.questionnaire.item.push(newItem);
            this.flattenedItems.push(new ItemModel(null, newItem, 1));
        }
    }

    private findDescendentItems(itemModel: ItemModel): ItemModel[] {
        const children = _.filter(this.flattenedItems, (next) => next.parent === itemModel);
        let all = [].concat(children);
        _.each(children, (child) => {
            const next = this.findDescendentItems(child);
            all = all.concat(next);
        });
        return all;
    }

    public toggleExpandItem(itemModel: ItemModel) {
        if (itemModel.expanded) {
            const descendentItems = this.findDescendentItems(itemModel);

            for (let i = descendentItems.length - 1; i >= 0; i--) {
                const index = this.flattenedItems.indexOf(descendentItems[i]);
                this.flattenedItems.splice(index, 1);
            }

            itemModel.expanded = false;
        } else {
            let startingIndex = this.flattenedItems.indexOf(itemModel) + 1;

            _.each(itemModel.item.item, (item) => {
                const newItemModel = new ItemModel(itemModel, item, itemModel.level + 1);
                this.flattenedItems.splice(startingIndex, 0, newItemModel);
                startingIndex++;
            });

            itemModel.expanded = true;
        }
    }

    ngOnInit() {
        this.navSubscription = this.router.events.subscribe((e: any) => {
            if (e instanceof NavigationEnd && e.url.startsWith('/questionnaire/')) {
                this.getQuestionnaire();
            }
        });
        this.getQuestionnaire();
    }

    ngOnDestroy() {
        this.navSubscription.unsubscribe();
        this.configService.setTitle(null);
    }

    nameChanged() {
        this.configService.setTitle(`Questionnaire - ${this.questionnaire.title || this.questionnaire.name || 'no-name'}`);
    }

    ngDoCheck() {
        if (this.questionnaire) {
            this.validation = this.fhirService.validate(this.questionnaire);
        }
    }
}
