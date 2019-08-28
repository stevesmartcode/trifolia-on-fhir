import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BranchModel, FileModel, GithubService, RepositoryModel} from '../../shared/github.service';
import {ExportOptions, ExportService} from '../../shared/export.service';
import {Globals} from '../../../../../../libs/tof-lib/src/lib/globals';
import JSZip from 'jszip';
import {getErrorString} from '../../../../../../libs/tof-lib/src/lib/helper';

@Component({
  selector: 'tof-export-github',
  templateUrl: './export-github.component.html',
  styleUrls: ['./export-github.component.css']
})
export class ExportGithubComponent implements OnInit, OnChanges {
  @Input() options: ExportOptions;
  repositories: RepositoryModel[] = [];
  repository: string;
  branches: BranchModel[] = [];
  branch: string;
  message: string;
  Globals = Globals;

  private igZip: JSZip;

  constructor(public githubService: GithubService, private exportService: ExportService) { }

  async getImplementationGuideExport() {
    this.options.includeIgPublisherJar = false;
    this.options.downloadOutput = false;

    const exportContent = await this.exportService.exportHtml(this.options).toPromise();

    const zipFile: JSZip = new JSZip();
    zipFile.loadAsync(exportContent.body)
      .then((zip: JSZip) => {
        this.igZip = zip;
      });
  }


  private get ownerLogin() {
    if (!this.repository) {
      return;
    }

    return this.repository.substring(0, this.repository.indexOf('/'));
  }

  private get repositoryName() {
    if (!this.repository) {
      return;
    }

    return this.repository.substring(this.repository.indexOf('/') + 1);
  }

  async repositoryChanged() {
    try {
      const foundRepository = this.repositories.find(r => r.full_name === this.repository);
      this.branches = await this.githubService.getBranches(this.ownerLogin, this.repositoryName).toPromise();
      this.branch = foundRepository.default_branch || 'master';
    } catch {
    }
  }

  async initGithub() {
    try {
      await this.githubService.login().toPromise();
      this.repositories = await this.githubService.getRepositories().toPromise();
    } catch {

    }
  }

  get exportDisabled(): boolean {
    if (!this.githubService.token || !this.repository || !this.branch || !this.message) {
      return true;
    }

    return false;
  }

  async export(): Promise<{ success: boolean, message: string }> {
    const zipEntries = Object.keys(this.igZip.files).map((name) => {
      return this.igZip.files[name];
    });
    const topDirectories = zipEntries.filter(e => e.dir && e.name.split('/').length === 2 && e.name.endsWith('/'));
    const zipFileNames = zipEntries.filter(e => !e.dir).map(e => e.name);
    const zipContentPromises = zipEntries.filter(e => !e.dir).map(e => e.async('base64'));
    const zipContents = await Promise.all(zipContentPromises);
    const files: FileModel[] = zipContents.map((content: string, index: number) => {
      return {
        path: zipFileNames[index],
        content: content
      };
    });

    try {
      console.log('mapping zip');

      await this.githubService.updateContents(this.ownerLogin, this.repositoryName, this.message, files, this.branch).toPromise();
      return {
        success: true,
        message: 'Done exporting to GitHub'
      };
    } catch (ex) {
      return {
        success: false,
        message: getErrorString(ex)
      };
    }
  }

  async ngOnInit() {
    this.initGithub();
    this.getImplementationGuideExport();
  }

  ngOnChanges(changes: SimpleChanges) {
  }
}
