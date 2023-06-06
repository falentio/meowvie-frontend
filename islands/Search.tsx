import { Signal, useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";

const placeholders = [
	"One Piece Episode 1063",
	"Boruto Episode 12",
	"Episode 12 Kimetsu",
	"Full Metal 23",
];

export interface SearchProps {
	meowvieEndpoint: string;
	providers: string[];
}

export const Search = ({ meowvieEndpoint, providers }: SearchProps) => {
	const query = useSignal("");
	const additionalQuery = useSignal("");
	const debouncedQuery = useSignal("");
	const fast = useSignal(false);
	const limit = useSignal(-1);
	useEffect(() => {
		console.log(additionalQuery.value);
		const delay = fast.value ? 0 : 350;
		const id = setTimeout(() => {
			debouncedQuery.value = (query.value + " " + additionalQuery.value)
				.trim();
		}, delay);
		return () => {
			clearTimeout(id);
		};
	}, [query.value, additionalQuery.value]);
	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				class="bg-white rounded-md shadow p-4 border-blue-500 border-t-4 space-y-2"
			>
				<label class="flex flex-col space-y-2">
					<h2 class="text-lg font-bold">Judul</h2>
					<div class="flex flex-row  rounded-md overflow-hidden">
						<input
							class="bg-blue-100 ring-x w-full h-8 px-2 py-1"
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
				</label>
				<h2 class="text-lg font-bold">Server</h2>
				<div class="flex flex-row gap-2">
					{providers.map((p) => (
						<label class="bg-blue-500 rounded-lg flex flex-col p-2">
							<span class="uppercase">{p}</span>
							<input
								name="provider"
								type="radio"
								class="w-4 h-4 mx-auto text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								onChange={(e) => {
									if (e.currentTarget.checked) {
										additionalQuery
											.value = " +Provider:" + p +
												"^0.2127901230";
									}
								}}
							/>
						</label>
					))}
					<button
						onClick={() => {
							const r = document.querySelector<HTMLInputElement>(
								"input[name=provider]:checked",
							);
							r && (r.checked = false);
							additionalQuery.value = "";
						}}
						class="bg-red-500 w-12 items-center justify-center inline-flex rounded-lg flex flex-col p-2"
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
				<label class="inline-flex items-center h-6 w-full">
					<span class="flex-auto">Mode Cepat (Fast Mode)</span>
					<input
						type="checkbox"
						class="h-4 w-4 mt-1"
						checked={fast.value}
						onChange={(e) => fast.value = e.currentTarget.checked}
					/>
				</label>

				{limit.value > -1 && (
					<span class="w-full">
						Batas pencarian tersisa: {limit.value}
					</span>
				)}
			</form>
			<SearchResult
				query={debouncedQuery.value}
				ready={debouncedQuery.value ===
					(query.value + " " + additionalQuery.value).trim()}
				key={debouncedQuery.value}
				limit={limit}
				meowvieEndpoint={meowvieEndpoint}
			/>
		</>
	);
};

interface SearchResultProps {
	query: string;
	ready: boolean;
	limit: Signal<number>;
	meowvieEndpoint: string;
}

const SearchResult = (
	{ query, ready, limit, meowvieEndpoint }: SearchResultProps,
) => {
	if (!ready) {
		return <Loading></Loading>;
	}
	if (!query) {
		return <></>;
	}
	const movies = useSignal([] as Record<string, unknown>[]);
	const error = useSignal<Error | null>(null);
	useEffect(() => {
		const meowvie = new URL(meowvieEndpoint);
		const url = new URL("/movie/search", meowvie);
		url.searchParams.set("q", query);
		fetch(url.href)
			.then(async (res) => {
				if (!res.ok) {
					error.value = new Error("failed to get movies");
				}
				movies.value = await res.json();
				limit.value = +(res.headers.get("x-limit-remain") || "-1");
				if (!movies.value.length) {
					error.value = new Error("failed to get movies");
				}
			});
	}, []);
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
			{movies.value.map((m) => {
				return <MovieItem movie={m} />;
			})}
		</div>
	);
};

const Loading = () => {
	return (
		<>
			{Array.from({ length: 3 }).map(() => (
				<div class="animate-pulse bg-white space-y-2 w-full flex flex-col rounded-md shadow-md border-blue-500 border-t-2 inline-flex p-4">
					<div class="w-full justify-center inline-flex">
						<div class="bg-gray-200 h-48 w-32 rounded-lg"></div>
					</div>
					<div class="h-6 w-full font-bold bg-gray-200 text-transparent">
						one piece episode 1064 subtitle bahasa indoenesia
					</div>
					<div class="w-36 h-5 bg-gray-200"></div>
					<div class="flex flex-row flex-wrap gap-2 mb-2">
						<div class="rounded bg-gray-200 h-8 w-14"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-20"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-18"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
					</div>
					<div class="w-36 h-5 bg-gray-200"></div>
					<div class="flex flex-row flex-wrap gap-2 mb-2">
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-20"></div>
						<div class="rounded bg-gray-200 h-8 w-14"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-18"></div>
						<div class="rounded bg-gray-200 h-8 w-16"></div>
						<div class="rounded bg-gray-200 h-8 w-20"></div>
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
		<div class="w-full bg-white flex flex-col rounded-md shadow border-blue-500 border-t-2 inline-flex p-4">
			<a
				target="_blank"
				href={"/image/" + movie.id}
				class="w-full h-48 overflow-hidden inline-flex"
			>
				<img
					loading="lazy"
					src={"/image/" + movie.id}
					class="mx-auto object-contain rounded-lg"
				/>
			</a>

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
