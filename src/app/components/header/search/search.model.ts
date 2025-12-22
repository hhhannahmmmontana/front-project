import { ChangeDetectorRef } from "@angular/core";
import {
    debounceTime,
    distinctUntilChanged,
    EMPTY,
    finalize,
    map,
    Subject,
    Subscription,
    switchMap,
    takeWhile,
    tap
} from "rxjs";
import SearchService from "../../../services/search.service";
import { SnackbarService } from "../../../services/snackbar.service";
import { Router } from "@angular/router";

export default class SearchModel {
    searchInput = "";
    searchLoading = false;
    searchFocused = false;
    hints: string[] = [];

    readonly search$ = new Subject<string>();
    private searchSub = new Subscription();

    constructor(
        private searchService: SearchService,
        private snackbarService: SnackbarService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    init() {
        this.searchSub = this.search$.pipe(
            map(value => value.trim()),
            distinctUntilChanged(),

            switchMap(value => {
                if (!value || !this.searchFocused) {
                    this.searchLoading = false;
                    this.hints = [];
                    return EMPTY;
                }

                return value;
            }),

            tap(() => {
                this.searchLoading = true;
            }),

            debounceTime(100),
            switchMap(value =>
                this.searchService.getSearchHints(value).pipe(
                    takeWhile(() => this.searchLoading),
                    finalize(() => {
                        this.cdr.detectChanges();
                    })
                )
            ),
            finalize(() => this.searchLoading = false)
		).subscribe({
            next: hints => {
                this.hints = hints;
            },
            error: err => {
                this.snackbarService.err(err);
                this.hints = [];
            }
		});
    }

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

        window.location.href = '/?q=' + encodeURIComponent(this.searchInput);
    }
}
