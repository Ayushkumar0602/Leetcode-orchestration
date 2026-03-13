import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the given value.
 * Updates only after the specified delay has passed without the value changing.
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
