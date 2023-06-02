import { HandlerContext } from "$fresh/server.ts";
const meowvie = new URL(
	Deno.env.get("MEOWVIE_ENDPOINT") || "http://localhost:8080",
);
const limit = {} as {
	[ip: string]: {
		last: number;
		remain: number;
	};
};
export const handler = (req: Request, ctx: HandlerContext) => {
	const ip = (ctx.remoteAddr as Deno.NetAddr).hostname;
	const l = limit[ip] ||= {
		last: 0,
		remain: 0,
	};
	if (Date.now() - l.last > 600_000) {
		l.last = Date.now();
		l.remain = 300;
	}
	if (--l.remain < 1) {
		return new Response("", { status: 429 });
	}
	const q = new URL(req.url).searchParams.get("q");
	const target = new URL("/movie/search", meowvie);
	q && target.searchParams.set("q", q);
	const start = Date.now();
	return fetch(target.href).then((res) => {
		return new Response(res.body, {
			headers: {
				"x-limit-remain": l.remain.toString(),
				"cache-control": "no-store",
				"x-meowvie-response-time": (Date.now() - start).toString(),
			},
		});
	});
};
