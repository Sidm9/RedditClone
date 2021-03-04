import { Box, Button, Flex, Link } from '@chakra-ui/core'
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from "../utils/isServer";
interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation(); // Generated 
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(),
      });
    let body = null;

    // data is loading
    if (fetching) {
        body = null;

        // user not logged in 
    } else if (!data?.me) {

        body = (
            <>
                <NextLink href="login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="register">
                    <Link mr={2}>Register</Link>
                </NextLink>
            </>
        )

        // User is logged in 
    } else {

        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    variant='link'
                    onClick={
                        () => {
                            logout();
                        }}
                    isLoading={logoutFetching}
                   
                >
                    Logout
                </Button>
            </Flex>
        )

    }

    return (
        <Flex position="-webkit-sticky" top={0} zIndex={1000} bg='crimson' p={4} ml={'auto'}>


            <Box ml={'auto'} color="white">

                {body}

            </Box>
        </Flex>

    )
}

