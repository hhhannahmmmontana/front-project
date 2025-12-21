import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import UserModel from "../models/user.model";

@Injectable({ providedIn: 'root' })
export default class UserService {
    private mockUser: UserModel = {
        id: 1,
        name: "Volodya",
        imageUrl: null
    }

    constructor(
        private httpClient: HttpClient
    ) { }

    getCurrentUser(): Observable<UserModel | null> {
        return of(this.mockUser).pipe(
            delay(1000)
        )
    }
}