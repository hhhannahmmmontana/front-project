import { Component } from '@angular/core';
import { PostsComponent } from "../post/posts.component";
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-explore',
	imports: [PostsComponent],
	templateUrl: './explore.component.html',
	styleUrl: './explore.component.scss'
})
export class ExploreComponent {
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