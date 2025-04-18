import { Article } from "../components/Article";
import { Comments } from "../components/Comments";
const apiUrl = import.meta.env.VITE_API_URL;

export async function loader({ params }) {
    const { postId } = params;
    const postUrl = `${apiUrl}/post/${postId}`;
    const commentsUrl = `${apiUrl}/post/${postId}/comment`;

    const [postRes, commentsRes] = await Promise.all([
        fetch(postUrl),
        fetch(commentsUrl),
    ]);

    if (!postRes.ok) {
        throw new Response("Failed to fetch post: ", {
            status: postRes.status,
        });
    }

    if (!commentsRes.ok) {
        throw new Response("Failed to fetch comments: ", {
            status: commentsRes.status,
        });
    }

    const post = await postRes.json();
    const commentsRaw = await commentsRes.json();

    return { post: post.post, comments: commentsRaw.post.comments };
}

export function meta({ data, params }) {
    return [
        { title: data.post.title ? `${data.post.title} | My Blog` : "My Blog" },
    ];
}

export default function Post({ loaderData }) {
    const { post, comments } = loaderData;
    return (
        <section>
            <Article post={post}></Article>
            <Comments commentsInitial={comments} postId={post.id} />
        </section>
    );
}
