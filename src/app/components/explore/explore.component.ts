import { Component } from '@angular/core';
import { PostsComponent } from "../post/posts.component";
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-explore',
	imports: [PostsComponent, FaIconComponent],
	templateUrl: './explore.component.html',
	styleUrl: './explore.component.scss'
})
export class ExploreComponent {
	icons = {
		faStar: faStar
	}

	query: string | null = null;
	tag: string | null = '';
	onlyFavourites: boolean = false;

	constructor(private route: ActivatedRoute) {
		this.route.queryParamMap.subscribe(params => {
			this.query = params.get('q') ?? null;
			this.tag = params.get('tag') ?? null;
			this.onlyFavourites = params.has('favourites');
		});
	}
}