import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import UserService from "./user.service";
import UserModel from "../models/user.model";
import GetPostsResponse from "../responses/get-posts.response";
import GetCommentsResponse from "../responses/get-comments.response";
import CreatePostRequest from "../requests/create-post.request";
import { environment } from "../../environments/development.environment";

@Injectable({ providedIn: 'root' })
class ExploreService {
    private readonly url = environment.apiDomain + "/jk";
    private currentUser: UserModel | null = null;

    constructor(
        private httpClient: HttpClient,
        private userService: UserService
    ) {
        this.userService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    getPosts(
        pageSize: number,
        token: string | null,
        tag: string | null,
        search: string | null,
        onlyFavourites: boolean
    ): Observable<GetPostsResponse> {
        let tUrl = this.url;
        let filters = [];
        tUrl += `?pageSize=${pageSize}`;
        if (token) {
            filters.push(`token=${token}`);
        }
        if (tag) {
            filters.push(`tags=${tag}`);
        }
        if (search) {
            filters.push(`search=${search}`);
        }
        if (onlyFavourites) {
            filters.push(`isFavourites=true`)
        }
        filters.push("username=volodyapokalipsis")
        if (filters.length > 0) {
            tUrl += '&';
        }
        tUrl += filters.join('&');
        return this.httpClient.get<GetPostsResponse>(tUrl);
    }

    getPostComments(
        postId: number,
        pageSize: number,
        token: string | null
    ): Observable<GetCommentsResponse> {
        return this.httpClient.get<GetCommentsResponse>(
            `${this.url}/${postId}/comments?pageSize=${pageSize}${(token) ? `&token=${token}` : ''}`
        );
    }

    ratePost(postId: number, rating: number): Observable<void> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.post<void>(`${this.url}/${postId}/rate`, {
            rating: rating,
            username: "volodyapokalipsis",
        });
    }

    commentPost(postId: number, content: string): Observable<CommentModel> {
        return this.httpClient.post<CommentModel>(`${this.url}/${postId}/comment`, {
            text: content,
            username: "volodyapokalipsis",
        });
    }

    addToFavourites(postId: number): Observable<void> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.post<void>(`${this.url}/${postId}/favourite`, {
            username: "volodyapokalipsis"
        });
    }

    removeFromFavorites(postId: number): Observable<void> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.delete<void>(`${this.url}/${postId}/favourite`, {
            body: {
                username: "volodyapokalipsis"
            }
        });
    }

    create(createRequest: CreatePostRequest): Observable<PostModel> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.post<PostModel>(`${this.url}`, {
            text: createRequest.text,
            tags: createRequest.tags,
            username: "volodyapokalipsis"
        });
    }

    private checkIfAuthorizedOrThrow() {
        if (this.currentUser) {
            return of(void 0);
        }

        return throwError(() => new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: {
                message: 'Invalid credentials'
            }
        }));
    }
}

export default ExploreService;
