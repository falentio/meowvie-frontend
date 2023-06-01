export interface GithubProfileProps {
	username: string;
	class?: string;
}

const GithubProfile = ({ username, class: c }: GithubProfileProps) => {
	return (
		<a href={`//github.com/${username}`} class="inline-flex">
			<div class={`overflow-hidden ${c ? c : ""}`}>
				<img
					src={`//github.com/${username}.png`}
					class="w-full h-full aspect-square"
				/>
			</div>
		</a>
	);
};

export default GithubProfile;
