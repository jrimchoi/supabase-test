const enabled = Boolean(
	process.env.NEXT_PUBLIC_DEBUG_AUTH || process.env.DEBUG_AUTH
);

export function logAuth(...args: unknown[]) {
	if (!enabled) return;
	// eslint-disable-next-line no-console
	console.log("[auth]", ...args);
}


