import CommentModel from "../models/comment.model";

export default interface GetCommentsResponse {
    value: CommentModel[],
    token: string | null
}