import React from "react"

export default (method, ...args) => {
	const [loading, setLoading] = React.useState(true)
	const [result, setResult] = React.useState(null)
	const [error, setError] = React.useState(null)

	if (typeof method !== "function") {
		return {
			loading: false,
			error: new Error("Method is not a function"),
			result: null,
			setResult: () => {},
			req: () => {},
			repeat: () => {},
		}
	}

	const req = async (..._) => {
		setLoading(true)
		setError(null)

		try {
			setResult(await method(..._))
		} catch (err) {
			console.error(err)
			setError(err)
		}

		setLoading(false)
	}

	// perform request on mount
	React.useEffect(() => {
		req(...args)
	}, [])

	return {
		loading: loading,
		error: error,

		result: result,
		setResult: setResult,

		req: req,
		repeat: () => req(...args),
	}
}
