import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export default class SearchService {
    mockHints = [
        "Про медведя",
        "Про русского",
        "Про зарядку",
        "Про киборга",
        "Про орла",
        "Про собачку"
    ]

    constructor(
        private httpClient: HttpClient
    ) { }

    getSearchHints(text: string, maxAmount: number = 5): Observable<string[]> {
        return of(this.mockHints.sort(() => Math.random() - 0.5).slice(0, maxAmount)).pipe(
            delay(1000)
        );
    }
}