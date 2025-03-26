async function importFilesFrom(from) {
    let paths = {
        // @ts-ignore
        ...import.meta.glob(`${from}/**.ts`),
        // @ts-ignore
        ...import.meta.glob(`${from}/**.js`),
    }

    let fns = {}

    for (const path in paths) {
        // @ts-ignore
        const name = path.split("/").pop().replace(".ts", "").replace(".js", "")
        const fn = await paths[path]()

        fns[name] = fn.default
    }

    return fns
}

export default importFilesFrom