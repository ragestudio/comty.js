async function exportObjs() {
    if (window) {
        let paths = {
            ...import.meta.glob("./**.ts"),
            ...import.meta.glob("./**.js"),
        }

        let fns = {}

        for (const path in paths) {
            const name = path.split("/").pop().replace(".ts", "").replace(".js", "")
            const fn = await paths[path]()

            fns[name] = fn.default
        }

        return fns
    } else {
        let objs = {}
        
        const dirs = fs.readdirSync(__dirname).filter(file => file !== "index.js")

        const fs = require("fs")
        const path = require("path")

        dirs.forEach((file) => {
            const model = require(path.join(__dirname, file)).default

            objs[file.replace(".js", "")] = model
        })

        return objs
    }
}

export default await exportObjs()
