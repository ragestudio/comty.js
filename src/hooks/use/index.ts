import React from "react"

export default function use<
	TMethod extends (...args: any[]) => any,
	TArgs extends Parameters<TMethod> = Parameters<TMethod>,
	TReturn = Awaited<ReturnType<TMethod>>,
>(method: TMethod, ...args: TArgs) {
	const [loading, setLoading] = React.useState<boolean>(true)
	const [result, setResult] = React.useState<TReturn | null>(null)
	const [error, setError] = React.useState<Error | unknown | null>(null)

	if (typeof method !== "function") {
		return {
			loading: false,
			error: new Error("Method is not a function"),
			result: null,
			setResult: () => {},
			req: async () => {},
			repeat: async () => {},
		}
	}

	const req = async (..._: TArgs) => {
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
		loading,
		error,
		result,
		setResult,
		req,
		repeat: () => req(...args),
	}
}
