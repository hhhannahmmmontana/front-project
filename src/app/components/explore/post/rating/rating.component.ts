import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import PostModel from "../../../../models/post.model";
import ExploreService from "../../../../services/explore.service";
import { catchError, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { SnackbarService } from "../../../../services/snackbar.service";

@Component({
    selector: "app-rating",
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: "./rating.component.html",
    styleUrl: "./rating.component.scss"
})
export class RatingComponent {
    icons = {
        faStarSolid: faStarSolid,
        faStarRegular: faStarRegular
    }

    starsRange = [1, 2, 3, 4, 5];

    @Input() post!: PostModel

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        public snackbarService: SnackbarService
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
        const prevRating = this.post.rating;
        this.post.userRating = rating;

        return this.exploreService.ratePost(this.post.id, rating)
            .subscribe({
                error: err => {
                    if ([401, 403].includes(err.status)) {
                        this.post.userRating = null;
                    } else {
                        this.post.userRating = prevRating;
                    }
                    this.cdr.detectChanges();
                    this.snackbarService.err(err);
                }
            })
    }
}