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

function setupSocket(socket: WebSocket, ip: string) {
	socket.onmessage = (ev) => {
		const data = JSON.parse(ev.data);
		if (data.event === "query") {
			const l = limit[ip] ||= {
				last: 0,
				remain: 0,
			};
			if (Date.now() - l.last > 600_000) {
				l.last = Date.now();
				l.remain = 300;
			}
			if (--l.remain < 1) {
				socket.send(`{"event":"error"}`);
				return;
			}
			const q = data.query;
			const target = new URL("/movie/search", meowvie);
			target.searchParams.set("q", q);
			fetch(target.href).then(async (res) => {
				if (!res.ok) {
					socket.send(`{"event":"error"}`);
				}
				const movies = await res.json();
				socket.send(JSON.stringify({
					query: q,
					event: "query",
					movies,
					start: data.start,
				}));
			});
			return;
		}
	};
}

export const handler = (req: Request, ctx: HandlerContext) => {
	const { response, socket } = Deno.upgradeWebSocket(req, {
		idleTimeout: 60,
	});
	const ip = (ctx.remoteAddr as Deno.NetAddr).hostname;
	setupSocket(socket, ip);
	return response;
};
