import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UserService {

    constructor(public http: HttpClient) { }

    public getUsers(): void {
        this.http.get('/api/user')
            .subscribe(data => {
            },
            error => {
                console.error(error);
            });
    }
}
