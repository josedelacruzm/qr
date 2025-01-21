import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const navigate = useNavigate();

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const response = await fetch(`/api/usuarios/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsAuthenticated(true);
            } else if (response.status === 401) {
                setTokenExpired(true);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            } else {
                console.error('Error response:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error details:', errorText);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            fetchUser();
        }
    }, [fetchUser, isAuthenticated]);

    const refreshToken = useCallback(async () => {
        try {
            const response = await fetch(`/api/usuarios/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const { token, user } = await response.json();
                localStorage.setItem('token', token);
                setUser(user);
                setTokenExpired(false);
            } else {
                console.error('Error al refrescar el token');
                setTokenExpired(true);
            }
        } catch (error) {
            console.error('Error al refrescar el token:', error);
            setTokenExpired(true);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
    }, [navigate]);

    return { user, isLoading, isAuthenticated, tokenExpired, refreshToken, logout };
};

export default useAuth;
