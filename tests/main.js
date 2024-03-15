const test = require("ava")
const lib = require("../dist/index")

test("create client", async (t) => {
    console.log(lib)

    const client = await lib.createClient()
    
    console.log(client)

    t.pass()
})
