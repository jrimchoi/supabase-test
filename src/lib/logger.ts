const enabled =
	process.env.NEXT_PUBLIC_DEBUG_AUTH === "1" ||
	process.env.DEBUG_AUTH === "1" ||
	process.env.NODE_ENV !== "production";

export function 	logAuth(...args: unknown[]) {
	if (!enabled) return;
	// eslint-disable-next-line no-console
	console.log("[auth]", ...args);
}


