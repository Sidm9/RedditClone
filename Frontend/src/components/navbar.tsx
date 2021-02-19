import { Box, Button, Flex, Link } from '@chakra-ui/react'
import React from 'react'
import NextLink from "next/link";
import { useMeQuery } from '../generated/graphql';
interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery();
    let body = null;

    // data is loading
    if (fetching) {
        body = null;

        // user not logged in 
    } else if (!data?.me) {

        body = (
            <>
                <NextLink href="login">
                    <Link mr={2} color="white">Login</Link>
                </NextLink>
                <NextLink href="register">
                    <Link mr={2} color="white">Register</Link>
                </NextLink>
            </>
        )

        // User is logged in 
    } else {

        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button variant='link'>Logout</Button>
            </Flex>
        )

    }

    return (
        <Flex bg='crimson' p={4} ml={'auto'}>


            <Box ml={'auto'}>

                {body}

            </Box>
        </Flex>

    )
}

export default Navbar
