import {
    Subject,
    Subscription
} from "rxjs";
import { Router } from "@angular/router";

export default class SearchModel {
    searchInput = "";
    searchLoading = false;
    searchFocused = false;
    hints: string[] = [];

    readonly search$ = new Subject<string>();
    private searchSub = new Subscription();

    constructor(
        private router: Router
    ) { }

    destroy() {
        this.searchSub.unsubscribe();
    }

    onInput() {
        this.search$.next(this.searchInput);
    }

    onFocus() {
        this.searchFocused = true;
        this.search$.next(this.searchInput);
    }

    onBlur() {
        this.searchFocused = false;
    }

    search() {
        if (this.searchInput.length == 0) {
            return;
        }


        this.searchInput = this.searchInput.trim();

        this.router.navigate(['/'], {
            queryParams: { q: this.searchInput },
            queryParamsHandling: 'merge'
        });
    }
}
