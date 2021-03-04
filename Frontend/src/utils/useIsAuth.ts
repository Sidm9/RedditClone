import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {


    // IF NOT LOGGED IN THEN REDIRECT TO LOGIN PAGE

    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    console.log("USEIS AUTHHH ", router);
    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace("/login?next= " + router.pathname) // After login go back to create-post
        }
    }, [fetching, data, router])


};