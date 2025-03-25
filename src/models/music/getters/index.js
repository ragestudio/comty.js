function exportObjs() {
	if (typeof window !== "undefined") {
		const paths = {
			...import.meta.glob("./**.ts", { eager: true, import: "default" }),
			...import.meta.glob("./**.js", { eager: true, import: "default" }),
		}

		return Object.entries(paths).reduce((acc, [path, module]) => {
			const name = path
				.split("/")
				.pop()
				.replace(/\.(ts|js)$/, "")
			acc[name] = module
			return acc
		}, {})
	} else {
		const fs = require("fs")
		const path = require("path")

		return fs
			.readdirSync(__dirname)
			.filter((file) => file !== "index.js" && /\.js$/.test(file))
			.reduce((acc, file) => {
				const name = file.replace(/\.js$/, "")
				acc[name] = require(path.join(__dirname, file)).default
				return acc
			}, {})
	}
}

const exportedObjs = exportObjs()

export default exportedObjs
