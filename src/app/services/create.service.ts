import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import CreatePostRequest from "../requests/create-post.request";
import { delay, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export default class CreateService {
    constructor(
        private httpClient: HttpClient
    ) { }

    create(createRequest: CreatePostRequest) {
        return of().pipe(delay(1000));
    }
}