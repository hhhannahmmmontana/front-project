import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, of, tap } from "rxjs";
import LoginRequest from "../requests/login.request";
import RegisterRequest from "../requests/register.request";
import { environment } from "@env";

export interface User {
    username: string;
}

interface AuthResponse {
    access_token: string;
    user: User
}

@Injectable({ providedIn: 'root' })
export default class UserService {
    private readonly url = environment.apiDomain + "/auth";
    private readonly TOKEN_KEY = 'access_token';
    private readonly USER_KEY = 'user';
    private currentTokenSubject = new BehaviorSubject<string | null>(this.loadToken());
    public currentToken$ = this.currentTokenSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private httpClient: HttpClient
    ) {}

    login(request: LoginRequest): Observable<void> {
        return this.httpClient
            .post<AuthResponse>(this.url + "/login", request)
            .pipe(
                tap(response => this.setSession(response)),
                map(_ => {})
            );
    }

    register(request: RegisterRequest): Observable<void> {
        return this.httpClient
            .post<AuthResponse>(this.url + "/register", request)
            .pipe(
                tap(response => this.setSession(response)),
                map(_ => {})
            );
    }

    logout(): Observable<void> {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        return of();
    }

    getToken(): string | null {
        return this.currentTokenSubject.value;
    }

    private loadToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private loadUser(): User | null {
        const user = localStorage.getItem(this.USER_KEY);
        if (user) {
            return JSON.parse(user);
        } else {
            return null;
        }
    }

    private setSession(response: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentTokenSubject.next(response.access_token);
        this.currentUserSubject.next(response.user);
    }    
}