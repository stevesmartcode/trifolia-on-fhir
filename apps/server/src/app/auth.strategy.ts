import {Strategy} from 'passport-http-bearer';
import {PassportStrategy} from '@nestjs/passport';
import {HttpService, Injectable} from '@nestjs/common';
import {TofLogger} from './tof-logger';
import {ConfigService} from './config.service';
import jwksClient from 'jwks-rsa';

const jwt = require('jsonwebtoken');

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new TofLogger(HttpStrategy.name);
  private readonly jwksClient;

  constructor(private httpService: HttpService, private configService: ConfigService) {
    super();

    this.jwksClient = jwksClient({
      jwksUri: this.configService.auth.jwksUri
    });
  }

  async verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const getKey = (header, callback) => {
        this.jwksClient.getSigningKey(header.kid, (err, key: any) => {
          if (err) {
            callback(err);
            return;
          }

          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        });
      }

      const profile = jwt.verify(token, getKey, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  async validate(token: string) {
    try {
      const profile = await this.verify(token);

      if (profile.roles) {
        // For auth0 and keycloak, roles is a top-level property
        // For auth0, it is assigned by the "Auth0 Authorization" extension in the auth0 dashboard
        // For keycloak, configuration must be changed for "Client Scopes" > roles > Mappers > "client roles" to have the "token claim name" be assigned to the top-level "roles" property
        profile.isAdmin = profile.roles.indexOf('admin') >= 0;
      }  else {
        profile.isAdmin = false;
      }

      return profile;
    } catch (ex) {
      this.logger.error('Token validation failed: ' + ex.message);
      throw ex;
    }
  }
}
