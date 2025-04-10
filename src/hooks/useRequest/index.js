import React from "react"

export default (method, ...args) => {
	const [loading, setLoading] = React.useState(true)
	const [result, setResult] = React.useState(null)
	const [error, setError] = React.useState(null)

	if (typeof method !== "function") {
		return [() => {}, null, new Error("Method is not a function"), () => {}]
	}

	const makeRequest = (...newArgs) => {
		method(...newArgs)
			.then((data) => {
				setResult(data)
				setLoading(false)
			})
			.catch((err) => {
				console.error(err)
				setError(err)
				setLoading(false)
			})
	}

	React.useEffect(() => {
		makeRequest(...args)
	}, [])

	return [
		loading,
		result,
		error,
		(...newArgs) => {
			setLoading(true)
			makeRequest(...newArgs)
		},
		() => {
			setLoading(true)
			makeRequest(...args)
		},
	]
}
