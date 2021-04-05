import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {


    // IF NOT LOGGED IN THEN REDIRECT TO LOGIN PAGE

    const { data, loading } = useMeQuery();
    const router = useRouter();
    console.log("USEIS AUTHHH ", router);
    useEffect(() => {
        if (!loading && !data?.me) {
            router.replace("/login?next= " + router.pathname) // After login go back to create-post
        }
    }, [loading, data, router])


};