import router from "next/dist/next-server/lib/router/router";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery, useCreatePostMutation } from "../generated/graphql";

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery();

    // IF NOT LOGGED IN THEN REDIRECT TO LOGIN PAGE

    const router = useRouter(); 
    console.log(router)
    useEffect(() => {
        if (!data?.me) {
            router.replace("/login?next= " + router.pathname) // After login go back to create-post
        }
    }, [fetching, data, router])

};