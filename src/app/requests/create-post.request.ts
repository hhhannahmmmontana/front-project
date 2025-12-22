
export default class CreatePostRequest {
    constructor(
        public text: string = "",
        public tags: string[] = []
    ) { }
}