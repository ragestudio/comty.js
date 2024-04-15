import request from "../request"

// create a regex to detect params  with %% symbol, from the url
const paramMatchRegex = /(%[0-9a-f]{2}%)/g

export default (method: string = "GET", url: string = "/", params?: object, data?: object) => {
    return async function generatedRequest(arg0: any, arg1: any) {
        const requestObj = {
            method: method,
            url: url,
            params: params,
            data: data,
        }

        // search url for params
        // example: /namespace/search/[0]/data => /namespace/search/${arguments[0]}/data
        // if no url matches, merge params with arg0 and override data in requestObj
        if (url.match(paramMatchRegex)) {
            requestObj.url = url.replace(paramMatchRegex, (match) => {
                console.log(match)
                
                // replace with arguments
                const fnArgumentIndex = ""

                return match
            })
        } else {
            requestObj.params = {
                ...requestObj.params,
                ...arg0
            }
            requestObj.data = {
                ...requestObj.data,
                ...arg1
            }
        }

        if (typeof requestObj.params === "object" && requestObj.params) {
            Object.keys(requestObj.params).forEach((key) => {
                if (requestObj.params && typeof requestObj.params[key] === "string") {

                }
            })
        }
        

        const response = await request(requestObj)

        // @ts-ignore
        return response.data
    }
}