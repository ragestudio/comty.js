import React from "react"

/**
 * @deprecated use "use" instead
 */
export function useRequest<TReturn = any>(
	method: (...args: any[]) => Promise<TReturn>,
	...args: any[]
) {
	const [loading, setLoading] = React.useState(true)
	const [result, setResult] = React.useState<TReturn | null>(null)
	const [error, setError] = React.useState<Error | null>(null)

	if (typeof method !== "function") {
		return [
			() => {},
			null,
			new Error("Method is not a function"),
			() => {},
		] as const
	}

	const makeRequest = (...newArgs: any[]) => {
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
		(...newArgs: any[]) => {
			setLoading(true)
			makeRequest(...newArgs)
		},
		() => {
			setLoading(true)
			makeRequest(...args)
		},
		setResult,
	] as const
}

export default useRequest
