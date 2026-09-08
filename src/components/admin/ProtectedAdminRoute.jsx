
import React, { useEffect, useState } from 'react';
import {
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom';

import { verifyAuth } from '../service/auth.service';


const ProtectedAdminRoute = () => {

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const location = useLocation();


    useEffect(() => {

        let mounted = true;


        const checkAuthentication = async () => {

            try {

                const response = await verifyAuth();

                if (!mounted) return;


                if (response?.isAuthenticated === true) {

                    setIsAuthenticated(true);

                } else {

                    setIsAuthenticated(false);

                }

            } catch (error) {

                console.error(
                    'Authentication check failed:',
                    error
                );

                if (mounted) {
                    setIsAuthenticated(false);
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };


        checkAuthentication();


        return () => {
            mounted = false;
        };

    }, []);


    // =====================================================
    // CHECKING AUTH
    // =====================================================

    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">

                <div className="flex flex-col items-center gap-4">

                    <div
                        className="
                            w-10
                            h-10
                            border-4
                            border-slate-200
                            border-t-slate-800
                            rounded-full
                            animate-spin
                        "
                    />

                    <p className="text-sm text-slate-500">
                        Checking authentication...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: {
                        pathname: location.pathname,
                        search: location.search,
                        hash: location.hash,
                    },
                }}
            />
        );
    }


    // =====================================================
    // AUTHENTICATED
    // =====================================================

    return <Outlet />;
};


export default ProtectedAdminRoute;

