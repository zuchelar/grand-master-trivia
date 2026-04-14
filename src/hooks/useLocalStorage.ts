import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
	const [state, setState] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}

		try {
			const raw = localStorage.getItem(key);
			if (raw === null) {
				return initialValue;
			}

			return JSON.parse(raw) as T;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// Private mode, quota, or serialization failure — ignore.
		}
	}, [key, state]);

	return [state, setState];
}

export default useLocalStorage;
