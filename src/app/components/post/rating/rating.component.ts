import { ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import PostModel from "../../../models/post.model";
import ExploreService from "../../../services/explore.service";
import { Subscription } from "rxjs";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { SnackbarService } from "../../../services/snackbar.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-rating",
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: "./rating.component.html",
    styleUrl: "./rating.component.scss"
})
export class RatingComponent implements OnDestroy {
    icons = {
        faStarSolid: faStarSolid,
        faStarRegular: faStarRegular
    }

    starsRange = [1, 2, 3, 4, 5];
    sub = new Subscription();

    @Input() authorized!: boolean;
    @Input() post!: PostModel

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        public snackbarService: SnackbarService,
        private router: Router
    ) { }

    hoveredRating: number | null = null;
    
    onStarHover(rating: number) {
        this.hoveredRating = rating;
    }

    onStarLeave() {
        this.hoveredRating = null;
    }

    getStarWidth(): number {
        if (this.hoveredRating != null) {
            return (this.hoveredRating / 5) * 100;
        }
        
        if (this.post.userRating != null) {
            return (this.post.userRating / 5) * 100;
        }
        
        return (this.post.rating / 5) * 100;
    }

    getStarColorClass(): string {
        if (this.hoveredRating != null) {
            return 'stars-hover';
        }
        
        if (this.post.userRating != null) {
            return 'stars-user-rated';
        }

        return 'stars-average';
    }

    ratePost(rating: number) {
        if (!this.authorized) {
            this.router.navigateByUrl('register');
            return;
        }

        const prevRating = this.post.rating;
        if (!prevRating) {
            this.post.ratesAmount += 1;
        }
        debugger
        this.post.userRating = rating;

        this.sub.add(this.exploreService.ratePost(this.post.id, rating)
            .subscribe({
                next: value => {
                    debugger
                },
                error: err => {
                    debugger
                    if ([401, 403].includes(err.status)) {
                        this.post.userRating = null;
                    } else {
                        this.post.userRating = prevRating;
                        if (!prevRating) {
                            this.post.ratesAmount -= 1;
                        }
                    }
                    this.cdr.detectChanges();
                    this.snackbarService.err(err);
                }
            }));
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}