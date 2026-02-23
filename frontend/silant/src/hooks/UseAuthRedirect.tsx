import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export function useAuthRedirect (
    redirectPath: string,
    condition: boolean,
) {
    const navigate = useNavigate();

    useEffect( () =>
        {
            if ( condition ) {
                navigate(
                    redirectPath,
                    { replace: true }
                );
            };
        },
        [
            condition,
            navigate,
            redirectPath
        ]
    )
};
