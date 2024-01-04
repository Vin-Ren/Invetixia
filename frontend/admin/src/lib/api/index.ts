import axios from "axios";
import { refreshToken } from "./user";


export function configureAxios() {
    axios.defaults.withCredentials = true
    
    axios.interceptors.request.use(
        async (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) config.headers["Authorization"] = `Bearer ${token}`;
            return config;
        },
        (error) => Promise.reject(error)
    )
    
    axios.interceptors.response.use((res) => res, async (error) => {
        const requestConfig = error.config;
        if (error.response.status === 403 && !requestConfig._retry) {
            requestConfig._retry = true;
    
            const accessToken = await refreshToken()
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken)
                axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                return axios(requestConfig);
            }
        }
        return Promise.reject(error);
    })
}
