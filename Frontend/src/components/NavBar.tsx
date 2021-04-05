import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core'
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from "../utils/isServer";
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const router = useRouter();
    const [logout, { loading: logoutLoading }] = useLogoutMutation(); // Generated 
    const apolloClient = useApolloClient();
    const { data, loading } = useMeQuery({
        skip: isServer(),
    });
    let body = null;

    // data is loading
    if (loading) {
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
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button as={Link} mr={4} color="black" >Create Post</Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    variant='link'
                    onClick={
                        async () => {
                            await logout();
                            //router.reload();  Refresh after loggedout
                            await apolloClient.resetStore(); // Does the same as above

                        }}
                    isLoading={logoutLoading}

                >
                    Logout
                </Button>
            </Flex>
        )

    }

    return (
        <Flex position="sticky" top={0} zIndex={1} bg='black' p={4} ml={'auto'} align={'center'}>
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading color="white">LiReddit</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'} color="white">

                    {body}

                </Box>
            </Flex>
        </Flex>

    )
}

