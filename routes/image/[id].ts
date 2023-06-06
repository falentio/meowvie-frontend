import { HandlerContext } from "$fresh/server.ts";

const meowvie = new URL(
	Deno.env.get("MEOWVIE_ENDPOINT") || "http://localhost:8080",
);

export const handler = async (
	_req: Request,
	ctx: HandlerContext,
): Promise<Response> => {
	const id = ctx.params.id;
	const url = new URL("/movie/" + encodeURI(id), meowvie).href;
	const res = await fetch(url);
	if (res.status !== 200) {
		return new Response(res.body, {
			status: res.status,
		});
	}
	const { thumbnailUrl } = await res.json();
	const image = await fetch(thumbnailUrl);
	return new Response(image.body, {
		headers: { ...image.headers, "cache-control": "public, max-age=86400" },
	});
};
