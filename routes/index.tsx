import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
import GithubProfile from "../components/GithubProfile.tsx";
import Teer from "../components/Teer.tsx";
import GithubButton from "../components/GithubButton.tsx";
import Search from "../islands/Search.tsx";
import { HandlerContext, PageProps } from "$fresh/server.ts";

export const handler = (req: Request, ctx: HandlerContext) => {
	return ctx.render({
		meowvieEndpoint: Deno.env.get("MEOWVIE_ENDPOINT") || "'",
	});
};

export default function Home({ data: { meowvieEndpoint } }: PageProps) {
	return (
		<>
			<Head>
				<title>Meowvie App</title>
				<link rel="preconnect" href="https://fonts.bunny.net" />
				<link
					href="https://fonts.bunny.net/css?family=rubik:400"
					rel="stylesheet"
				/>
				<script
					async
					src="https://umami-falentio.vercel.app/script.js"
					data-website-id="e3f74611-aa7d-4ba7-bd9f-f5263945e1be"
				>
				</script>
			</Head>
			<div class="p-4 mx-auto max-w-screen-md font-['Rubik'] flex flex-col gap-4">
				<div class="flex flex-col md:flex-row items-center">
					<GithubProfile
						username="falentio"
						class="w-32 h-32 rounded-full"
					/>
					<div class="p-4 mx-4 flex-auto">
						<h1 class="mb-2 text-center font-bold text-4xl md:text-5xl">
							Meowvie
						</h1>
						<div class="flex flex-row justify-center gap-1">
							<Teer />
							<GithubButton />
						</div>
					</div>
				</div>
				<Search meowvieEndpoint={meowvieEndpoint} />
			</div>
		</>
	);
}
