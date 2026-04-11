import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, map, Observable, of, throwError } from "rxjs";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import UserService from "./user.service";
import UserModel from "../models/user.model";
import GetCommentsResponse from "../responses/get-comments.response";
import CreatePostRequest from "../requests/create-post.request";
import { environment } from "@env";
import { Apollo, gql } from 'apollo-angular';
import GetPostsResponse from "../responses/get-posts.response";

@Injectable({ providedIn: 'root' })
class ExploreService {
    private readonly url = environment.apiDomain + "/jk";
    private readonly PAGE_SIZE = 5;
    private currentUser: UserModel | null = null;
    constructor(
        private httpClient: HttpClient,
        private userService: UserService,
        private apollo: Apollo
    ) {
        this.userService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    getPostsByTag(
        tag: string,
        token: string | null = null,
    ): Observable<GetPostsResponse> {
        const query = gql`
            query SearchJokesByTag(
                $pageSize: Int!,
                $token: String,
                $tags: [String!]
            ) {
                jokes(
                    input: {
                        pageSize: $pageSize,
                        token: $token,
                        tags: $tags
                    }
                ) {
                    value {
                        id
                        text
                        tags
                        rating
                        ratesAmount
                        author
                        createdAt
                        isFavourite
                        userRating
                    }
                    nextToken
                }
            }
        `;
        return this.pipeApollo(this.apollo.query<{
            jokes: GetPostsResponse
        }>({
            query,
            variables: {
                pageSize: this.PAGE_SIZE,
                token,
                tags: [tag]
            }
        }));
    }

    getFavourites(
        token: string | null = null
    ): Observable<GetPostsResponse> {
        const query = gql`
            query SearchJokesByTag(
                $pageSize: Int!,
                $token: String
            ) {
                jokes(
                    input: {
                        pageSize: $pageSize,
                        token: $token,
                        isFavourites: true
                    }
                ) {
                    value {
                        id
                        text
                        tags
                        rating
                        ratesAmount
                        author
                        createdAt
                        isFavourite
                        userRating
                    }
                    nextToken
                }
            }
        `;
        return this.pipeApollo(this.apollo.query<{
            jokes: GetPostsResponse
        }>({
            query,
            variables: {
                pageSize: this.PAGE_SIZE,
                token
            }
        }));
    }

    searchPosts(
        search: string,
        token: string | null = null
    ): Observable<GetPostsResponse> {
        const query = gql`
            query SearchJokesByTag(
                $pageSize: Int!,
                $token: String,
                $search: String!
            ) {
                jokes(
                    input: {
                        pageSize: $pageSize,
                        token: $token,
                        search: $search
                    }
                ) {
                    value {
                        id
                        text
                        tags
                        rating
                        ratesAmount
                        author
                        createdAt
                        isFavourite
                        userRating
                    }
                    nextToken
                }
            }
        `;
        return this.pipeApollo(this.apollo.query<{
            jokes: GetPostsResponse
        }>({
            query,
            variables: {
                pageSize: this.PAGE_SIZE,
                token,
                search
            }
        }));
    }

    getPosts(
        token: string | null = null
    ): Observable<GetPostsResponse> {
        const query = gql`
            query SearchJokesByTag(
                $pageSize: Int!,
                $token: String
            ) {
                jokes(
                    input: {
                        pageSize: $pageSize,
                        token: $token
                    }
                ) {
                    value {
                        id
                        text
                        tags
                        rating
                        ratesAmount
                        author
                        createdAt
                        isFavourite
                        userRating
                    }
                    nextToken
                }
            }
        `;
        return this.pipeApollo(this.apollo.query<{
            jokes: GetPostsResponse
        }>({
            query,
            variables: {
                pageSize: this.PAGE_SIZE,
                token
            }
        }));
    }

    private pipeApollo(
        query: Observable<Apollo.QueryResult<{
            jokes: GetPostsResponse;
        }>>
    ): Observable<GetPostsResponse>  {
        return query.pipe(
            filter(it => it.data != undefined),
            map(it => it.data!.jokes),
            map(it => ({
                nextToken: it.nextToken,
                value: it.value.map((post: PostModel) => ({ ...post }))
            }))
        );
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
        return this.httpClient.post<void>(`${this.url}/${postId}/rate?rating=${rating}`, {});
    }

    commentPost(postId: number, content: string): Observable<CommentModel> {
        return this.httpClient.post<CommentModel>(`${this.url}/${postId}/comment`, {
            text: content
        });
    }

    addToFavourites(postId: number): Observable<void> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.post<void>(`${this.url}/${postId}/favourite`, {});
    }

    removeFromFavorites(postId: number): Observable<void> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.delete<void>(`${this.url}/${postId}/favourite`);
    }

    create(createRequest: CreatePostRequest): Observable<PostModel> {
        this.checkIfAuthorizedOrThrow();
        return this.httpClient.post<PostModel>(`${this.url}`, {
            text: createRequest.text,
            tags: Array.from(createRequest.tags)
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
