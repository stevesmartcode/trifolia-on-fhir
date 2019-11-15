import {EventEmitter, Injectable, Injector} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
//import * as auth0 from 'auth0-js';
import { JwksValidationHandler, OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { AuthConfig } from 'angular-oauth2-oidc';

import {PractitionerService} from './practitioner.service';
import {Group, Meta, Practitioner} from '../../../../../libs/tof-lib/src/lib/stu3/fhir';
import {ConfigService} from './config.service';
import {SocketService} from './socket.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {addPermission} from '../../../../../libs/tof-lib/src/lib/helper';
import {GroupService} from './group.service';
import {map} from 'rxjs/operators';

@Injectable()
export class AuthService {
  // expiresIn is in seconds
  private readonly fiveMinutesInSeconds = 300;

  //public auth0: any;
  public userProfile: any;
  public practitioner: Practitioner;
  public groups: Group[] = [];
  public authExpiresAt: number;
  public authChanged: EventEmitter<any>;
  public authError: string;
  public loggingIn = false;
  private authTimeout: any;

  constructor(
    public oauthService: OAuthService,
    private injector: Injector,
    private socketService: SocketService,
    private configService: ConfigService,
    private modalService: NgbModal,
    private practitionerService: PractitionerService,
    private groupService: GroupService) {
    this.authExpiresAt = JSON.parse(localStorage.getItem('expires_at'));
    this.authChanged = new EventEmitter();

  }

  private get activatedRoute(): ActivatedRoute {
    return this.injector.get(ActivatedRoute);
  }

  public get router(): Router {
    return this.injector.get(Router);
  }

  public init() {
    if (this.authExpiresAt) {
      this.setSessionTimer();
    }



    if (this.configService.config && this.configService.config.auth) {
      /*this.auth0 = new auth0.WebAuth({
        clientID: this.configService.config.auth.clientId,
        domain: this.configService.config.auth.domain,
        responseType: 'token',
        redirectUri: location.origin + '/login?pathname=' + encodeURIComponent(location.pathname),
        scope: this.configService.config.auth.scope
      });*/
      // URL of the SPA to redirect the user to after login

      // The SPA's id. The SPA is registerd with this id at the auth-server

      // set the scope for the permissions the client should request
      // The first three are defined by OIDC. The 4th is a usecase-specific one

      // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
      // OAuth2-based access_token

        // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
      // instead of localStorage

      // Discovery Document of your AuthServer as defined by OIDC
      //let url = 'https://oauth.lantanagroup.com/identity/.well-known/openid-configuration'; //https://steyer-identity-server.azurewebsites.net/identity/.well-known/openid-configuration';



      const config = new AuthConfig();
      config.issuer = 'http://localhost:8080/auth/realms/ToF';
      config.clientId = 'myapp';
      config.redirectUri = location.origin + '/login?pathname=' + encodeURIComponent(location.pathname);
      config.scope = this.configService.config.auth.scope;
      config.responseType = 'id_token token';
     // config.sessionChecksEnabled = true;
      config.oidc = true;
      config.requestAccessToken = true;

      this.oauthService.setStorage(localStorage);

      this.oauthService.configure(config);
      this.oauthService.tokenValidationHandler = new JwksValidationHandler();


      this.oauthService.loadDiscoveryDocument().then(() => {
         this.oauthService.tryLogin().then(() => {
            console.log("IS AUTHENTICATED FROM TRY LOGIN");
            console.log(this.oauthService.hasValidAccessToken());
           console.log(this.oauthService.hasValidIdToken());

           if(this.oauthService.hasValidAccessToken()){
             console.log("Success! Authenticated");

             console.log(this.isAuthenticated());
             this.setSession();
             this.handleAuthentication();
           }

         });
      });

    }
    this.authChanged.subscribe(() => {
      if (this.isAuthenticated()) {
        this.socketService.notifyAuthenticated(this.userProfile, this.practitioner);
      }
    });

    // If the socket re-connects, then re-send the authentication information for the connection
    this.socketService.onConnected.subscribe(() => {
      if (this.isAuthenticated()) {
        this.socketService.notifyAuthenticated(this.userProfile, this.practitioner);
      }
    });

    // When the FHIR server changes, get the profile for the user on the FHIR server
    // and then notify the socket connection that the user has been authenticated
    this.configService.fhirServerChanged.subscribe(async () => {
      await this.getProfile();

      if (this.isAuthenticated()) {
        this.socketService.notifyAuthenticated(this.userProfile, this.practitioner);
      }
    });

  }

  public login(): void {
    if (!this.oauthService) {
      return;
    }

    this.oauthService.initImplicitFlow();


  }



  public handleAuthentication() {
    if (!this.oauthService) {
      return;
    }

    if(this.isAuthenticated()) {
      this.loggingIn = true;
      this.authError = undefined;

      this.setSession();


      this.getProfile()
        .then(() => {

          window.location.hash = '';

          const path = this.activatedRoute.snapshot.queryParams.pathname || `/${this.configService.baseSessionUrl}/home`;

          this.authChanged.emit();
          this.socketService.notifyAuthenticated({
            userProfile: this.userProfile,
            practitioner: this.practitioner
          });

          if (path && path !== '/' && path !== '/logout' && path !== '/login') {
            // noinspection JSIgnoredPromiseFromCall
            this.router.navigate([path]);
          }
        })
        .catch(nextErr => this.authError = nextErr);
      this.loggingIn = false;
    }
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    this.userProfile = null;
    this.practitioner = null;
    this.authExpiresAt = null;
    this.socketService.authInfoSent = false;

    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
    }

    if (this.oauthService) {

    }

    // Go back to the home route
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate([`/${this.configService.fhirServer}/home`]);
    this.authChanged.emit();
  }

  public isAuthenticated(): boolean {
    return new Date().getTime() < this.authExpiresAt;
  }

  private async getAuthUserInfo(accessToken: string) {
    return new Promise((resolve, reject) => {

        resolve(this.userProfile = this.oauthService.loadUserProfile());
      });
  }

  public async getProfile(): Promise<{ userProfile: any, practitioner: Practitioner }> {
    if (!this.oauthService || !this.isAuthenticated()) {
      return Promise.resolve({userProfile: null, practitioner: null});
    }

    const accessToken = localStorage.getItem('token');

    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }



    this.userProfile = await this.getAuthUserInfo(accessToken);

    try {
      console.log("ABOUT TO CALL GET ME");

      this.practitioner = await this.practitionerService.getMe().toPromise();
    } catch (ex) {
      console.error(ex);
      this.practitioner = null;
    }

    console.log("AFTER GET USER INFO")
    console.log(this.userProfile);
    console.log(this.practitioner);

    try {
      this.groups = await this.groupService.getMembership()
        .pipe(map(groupsBundle =>
          (groupsBundle.entry || []).map(entry => <Group> entry.resource)
        ))
        .toPromise();
    } catch (ex) {
      console.error(ex);
      this.groups = [];
    }

    // This also triggers a notification to the socket
    this.authChanged.emit();

    return {
      userProfile: this.userProfile,
      practitioner: this.practitioner
    };
  }

  public getDefaultMeta(): Meta {
    const meta = new Meta();
    if (this.practitioner && this.configService.config.enableSecurity) {
      addPermission(meta, 'user', 'write', this.practitioner.id);
    }
    return meta;
  }

  private setSessionTimer() {
    if (!this.oauthService) {
      return;
    }
  }

  private setSession(): void {
    // Set the time that the access token will expire at

    const expiresAt = JSON.stringify((this.oauthService.getAccessTokenExpiration() * 1000) + new Date().getTime());

    console.log("IS AUTHENTICATED FROM SET SESSION");

    console.log("is Authenticated?");

    console.log(this.isAuthenticated());

    if(this.isAuthenticated()) {
      console.log(this.oauthService.hasValidAccessToken());
      console.log(this.oauthService.hasValidIdToken());

      console.log("token:" + this.oauthService.getAccessToken());
      console.log("id token:" + this.oauthService.getIdToken());



      console.log("LOCAL STORAGE IN SET SESSSION");
      console.log(localStorage);
      console.log(localStorage.length);
      console.log(localStorage.key(0));
      console.log(localStorage.key(1));
      console.log(localStorage.key(2));
      console.log(localStorage.key(3));
      console.log(localStorage.key(4));
      console.log(localStorage.key(5));
      console.log("****");

    }

    this.authExpiresAt = JSON.parse(expiresAt);

    localStorage.setItem('token', localStorage.getItem('access_token'));
    localStorage.setItem('id_token', localStorage.getItem('id_token')); //this.oauthService.getIdToken());
    localStorage.setItem('expires_at', expiresAt);

    this.setSessionTimer();

  }


  /*
  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    this.authExpiresAt = JSON.parse(expiresAt);

    this.setSessionTimer();
  }
   */
}
