import {Injectable} from '@angular/core';
import {Bundle, Practitioner} from '../../../../../libs/tof-lib/src/lib/stu3/fhir';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class PractitionerService {

  constructor(private http: HttpClient) {
    console.log("PRACTIONER SERVICE INITIATED")
  }

  public getUsers(content?: string, name?: string, email?: string, id?: string) {
    let url = '/api/practitioner/user?';

    if (content) {
      url += '_content=' + encodeURIComponent(content) + '&';
    }

    if (name) {
      url += 'name=' + encodeURIComponent(name) + '&';
    }

    if (email) {
      url += 'email=' + encodeURIComponent(email) + '&';
    }

    if (id) {
      url += '_id=' + encodeURIComponent(id) + '&';
    }

    return this.http.get<Bundle>(url);
  }

  public getMe(): Observable<Practitioner> {
      console.log("IN PRACTIONER SERVICE.. about to call the service");
      console.log("PERSON OBJ");
    return this.http.get('/api/practitioner/me')
      .pipe(map(personObj => new Practitioner(personObj)));
  }

  public updateMe(person: Practitioner): Observable<Practitioner> {
    return this.http.post('/api/practitioner/me', person)
      .pipe(map(personObj => new Practitioner(personObj)));
  }
}
