import * as React from "react";

type AuthCardProps = {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
	return (
		<div className="w-full max-w-md rounded-2xl border bg-white shadow-sm">
			<div className="px-10 py-14">
				<header>
					<h1 className="text-center text-4xl font-extrabold tracking-tight text-[#2f4b3b]">
						{title}
					</h1>
					{subtitle ? (
						<p className="mt-2 text-center text-sm text-neutral-500">
							{subtitle}
						</p>
					) : null}
				</header>

				<div className="mt-10">{children}</div>

				{footer ? <div className="mt-6">{footer}</div> : null}
			</div>
		</div>
	);
}
