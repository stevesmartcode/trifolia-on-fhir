import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ImportGithubPanelComponent} from './import-github-panel.component';
import {BrowserModule} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {FileDropModule} from 'ngx-file-drop';
import {TreeModule} from 'ng2-tree';
import {GithubService} from '../../services/github.service';
import {ConfigService} from '../../services/config.service';
import {Globals} from '../../globals';

describe('ImportGithubPanelComponent', () => {
    let component: ImportGithubPanelComponent;
    let fixture: ComponentFixture<ImportGithubPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ImportGithubPanelComponent],
            imports: [
                BrowserModule,
                RouterTestingModule,
                HttpClientModule,
                NgbModule.forRoot(),
                FormsModule,
                FileDropModule,
                TreeModule
            ],
            providers: [
                GithubService,
                ConfigService,
                Globals
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportGithubPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
