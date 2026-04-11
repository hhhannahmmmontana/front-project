import PostModel from "../models/post.model";

export default interface GetPostsResponse {
    value: PostModel[],
    nextToken: string | null
}