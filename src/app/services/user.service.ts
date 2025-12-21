import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, delay, Observable, of, throwError } from "rxjs";
import UserModel from "../models/user.model";
import LoginRequest from "../requests/login.request";
import RegisterRequest from "../requests/register.request";

class MockUser {
    constructor (
        public id: number,
        public username: string,
        public password: string
    ) { }
}

const USERS_KEY = 'mock_users';
const CURRENT_USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export default class UserService {
    users = new Map<string, MockUser>();
    private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    counter = 0;

    constructor(
        private httpClient: HttpClient
    ) {
        this.restore();
    }

    login(request: LoginRequest) {
        const user = this.users.get(request.username);
        if (!user || user.password !== request.password) {
            return throwError(() => new HttpErrorResponse({
                status: 401,
                statusText: 'Unauthorized',
                error: {
                message: 'Invalid credentials'
                }
            }));
        }

        const model: UserModel = {
            id: user.id,
            username: user.username
        };

        this.currentUserSubject.next(model);
        localStorage.setItem('current_user', JSON.stringify(model));

        return of(void 0).pipe(delay(1000));
    }

    register(request: RegisterRequest): Observable<void> {
        const user = new MockUser(
            ++this.counter,
            request.username,
            request.password
        );
        this.users.set(request.username, user);

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify([...this.users.values()])
        );

        return this.login(new LoginRequest(
            request.username,
            request.password
        ));
    }

    logout(): Observable<void> {
        this.currentUserSubject.next(null);
        localStorage.removeItem(CURRENT_USER_KEY);

        return of(void 0).pipe(delay(1000));
    }

    private restore() {
        const usersRaw = localStorage.getItem(USERS_KEY);
        const currentUserRaw = localStorage.getItem(CURRENT_USER_KEY);

        if (usersRaw) {
            const usersArray: MockUser[] = JSON.parse(usersRaw);
            usersArray.forEach(user => {
                this.users.set(user.username, user);
                this.counter = Math.max(this.counter, user.id);
            });
        }

        if (currentUserRaw) {
            this.currentUserSubject.next(JSON.parse(currentUserRaw));
        }
    }
}