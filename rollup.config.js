import typescript from "@rollup/plugin-typescript";

/**
 * @type {import("rollup").RollupOptions}
 */
const options = {
	input: "src/index.ts",
	output: {
		file: "dist/index.js",
		format: "cjs",
	},
	plugins: [typescript()],
	watch: {
		clearScreen: false,
		exclude: ["node_modules/**/*"],
		include: "src/**/*",
		buildDelay: 6000,
		chokidar: { usePolling: true },
	},
	external: ["viber-bot"],
};

export default options;
