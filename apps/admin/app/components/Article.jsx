export function Article({ post }) {
    return (
        <article className="p-6">
            <h2 className="text-4xl pb-2 font-bold">{post.title}</h2>
            <p className="pb-8 pl-8 text-xl">
                By {post.author.firstName + " " + post.author.lastName}
            </p>
            <div
                className="text-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    );
}
