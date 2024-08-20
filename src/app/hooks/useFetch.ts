import { useState, useEffect } from "react";
import { api } from "../utils/api.ts";

const useFetch = <T>(url: string) => {
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<T>(url);
                if (response.status!==200) {
                    throw new Error(response.statusText);
                }

                const res = typeof response.data === 'string'
                    ? JSON.parse(response.data)
                    : response.data;

                setIsLoading(false);
                setData(res);
            } catch (error) {
                setError(`${error} Could not Fetch Data `);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url]);
    return {
        data,
        isLoading,
        error};
};

export default useFetch