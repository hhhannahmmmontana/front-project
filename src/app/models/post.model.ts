
export default interface PostModel {
    id: number,
    text: string,
    createdAt: Date,
    author: string | null,
    rating: number,
    ratingAmount: number,
    userRating: number | null,
    isFavourite: boolean,
    tags: Set<string>
}