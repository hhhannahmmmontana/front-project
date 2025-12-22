
export default interface CommentModel {
    id: number,
    content: string,
    author: string | null,
    date: Date
}