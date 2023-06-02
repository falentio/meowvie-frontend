import { Signal, useSignal } from "@preact/signals";
import { useEffect, useMemo, useState } from "preact/hooks";

const placeholders = [
	"One Piece Episode 1063",
	"Boruto Episode 12",
	"Episode 12 Kimetsu",
	"Full Metal 23",
];

export const Search = () => {
	const query = useSignal("");
	const fast = useSignal(true);
	const debouncedQuery = useSignal("");
	useEffect(() => {
		const id = setTimeout(() => {
			debouncedQuery.value = query.value;
		}, 350);
		return () => {
			clearTimeout(id);
		};
	}, [query.value]);
	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				class="rounded-md shadow p-4 border-blue-500 border-t-4"
			>
				<label class="flex flex-col space-y-2">
					<span class="text-lg">Judul</span>
					<div class="flex flex-row  rounded-md overflow-hidden">
						<input
							class="bg-gray-100 ring-x w-full h-8 px-2 py-1"
							type="text"
							value={query.value}
							placeholder={placeholders[Math.random() * 3 | 0]}
							onInput={(e) => query.value = e.currentTarget.value}
						/>
						<button
							class="w-10 h-8 bg-red-500 inline-flex items-center justify-center"
							onClick={() => {
								query.value = "";
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
								/>
							</svg>
						</button>
					</div>
					<label class="flex flex-row w-full items-center">
						<span class="flex-auto">Mode Cepat (Fast Mode):</span>
						<input
							type="checkbox"
							checked={fast.value}
							onChange={(e) =>
								fast.value = e.currentTarget.checked}
						/>
					</label>
				</label>
			</form>
			<SearchResult
				query={fast.value ? query : debouncedQuery}
				fast={fast.value}
				key={!fast.value && debouncedQuery.value}
			/>
		</>
	);
};

interface SearchResultProps {
	query: Signal<string>;
	fast?: boolean;
}

const SearchResult = ({ query, fast }: SearchResultProps) => {
	if (!query.value) {
		return <></>;
	}
	const socket = useMemo(() => {
		const url = new URL("/api/ws", new URL(window.location.href));
		if (url.protocol === "https:") {
			url.protocol = "wss:";
		} else {
			url.protocol = "ws:";
		}
		return new WebSocket(url);
	}, []);
	const movies = useSignal([] as Record<string, unknown>[]);
	const error = useSignal<Error | null>(null);
	const latency = useSignal(0);
	useEffect(() => console.log("latency", latency.value), [latency.value]);
	useEffect(() => {
		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.event === "query" && data.query === query.value) {
				latency.value = Date.now() - data.start;
				movies.value = data.movies;
				if (!data.movies.length) {
					error.value = new Error("failed to get movies");
				}
			}
			if (data.event === "error") {
				error.value = new Error("failed to get movies");
			}
		};
		socket.onopen = () => {
			console.log("connected", socket.url);
		};
	}, []);
	useEffect(() => {
		error.value = null;
		if (fast) {
			socket.send(JSON.stringify({
				query: query.value,
				start: Date.now(),
				event: "query",
			}));
			return;
		}
		const url = new URL("/api/search", new URL(window.location.href));
		url.searchParams.set("q", query.value);
		const start = Date.now();
		fetch(url.href)
			.then(async (res) => {
				if (!res.ok) {
					error.value = new Error("failed to get movies");
				}
				latency.value = Date.now() - start;
				movies.value = await res.json();
				if (!movies.value.length) {
					error.value = new Error("failed to get movies");
				}
			});
	}, [query.value]);
	if (error.value) {
		return (
			<div class="text-center w-full flex flex-col rounded-md shadow-md border-red-500 border-t-2 inline-flex p-4">
				<h2 class="text-xl">
					Tidak dapat menemukan film yang anda cari
				</h2>
			</div>
		);
	}
	if (!movies.value.length && query) {
		return <Loading />;
	}
	return (
		<div class="grid grid-cols-1 gap-4">
			<div class=" space-y-2 w-full flex flex-col rounded-md shadow-md border-blue-500 border-t-2 inline-flex p-4">
				Ping: {latency.value.toLocaleString()}ms
			</div>
			{movies.value.map((m) => {
				return <MovieItem movie={m} />;
			})}
		</div>
	);
};

const Loading = () => {
	return (
		<>
			<div class="animate-pulse space-y-2 w-full flex flex-col rounded-md shadow-md border-blue-500 border-t-2 inline-flex p-4">
				<div class="w-full mx-auto h-6 bg-gray-200"></div>
			</div>
			{Array.from({ length: 3 }).map(() => (
				<div class="animate-pulse space-y-2 w-full flex flex-col rounded-md shadow-md border-blue-500 border-t-2 inline-flex p-4">
					<div class="w-full mx-auto h-6 bg-gray-200"></div>
					<div class="w-60 mx-auto h-6 bg-gray-200"></div>
					<div class="w-36 h-3 bg-gray-200"></div>
					<div class="flex flex-row flex-wrap gap-2 mb-2">
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
					</div>
					<div class="w-36 h-3 bg-gray-200"></div>
					<div class="flex flex-row flex-wrap gap-2 mb-2">
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
						<div class="rounded bg-gray-200 h-6 w-16"></div>
					</div>
				</div>
			))}
		</>
	);
};

interface MovieItemProps {
	movie: any;
}

const MovieItem = ({ movie }: MovieItemProps) => {
	return (
		<div class="w-full flex flex-col rounded-md shadow border-blue-500 border-t-2 inline-flex p-4">
			<h2 class="text-lg text-center font-bold">{movie.title}</h2>
			<div class="flex flex-col gap-1">
				{groupDownloadUrl(movie.downloadUrl).map((i) => {
					return <GroupUrl name={i[0]} urls={i[1]} />;
				})}
			</div>
		</div>
	);
};

interface GroupUrlProps {
	name: string;
	urls: {
		server: string;
		url: string;
	}[];
}

const GroupUrl = ({ urls, name }: GroupUrlProps) => {
	return (
		<>
			<h3 class="text-start text-md">
				<span>{name}</span>
			</h3>
			<div class="flex flex-row flex-wrap gap-2 mb-4">
				{urls.map(({ url, server }) => {
					return (
						<a
							target="_blank"
							class="ring-blue-500 ring-2 p-1 hover:text-white rounded hover:bg-blue-500"
							href={url}
						>
							{server}
						</a>
					);
				})}
			</div>
		</>
	);
};

function groupDownloadUrl(downloadUrl: any[]) {
	const resolutions = {} as {
		[resolution: string]: {
			server: string;
			url: string;
		}[];
	};
	for (const d of downloadUrl) {
		if (!d.id) {
			continue;
		}
		let name = d.resolution;
		if (d.size) {
			name = `${name} [${d.size}]`;
		}
		const arr = resolutions[name] ||= [];
		arr.push({
			server: d.server,
			url: d.url,
		});
	}
	return Array.from(Object.entries(resolutions));
}

interface DownloadUrlButton {
	href: string;
}

export default Search;
