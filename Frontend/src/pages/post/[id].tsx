import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { useRouter } from 'next/router'
import { usePostQuery } from '../../generated/graphql'
import { Layout } from '../../components/Layout'
import { Box } from '@chakra-ui/core'

const Post = ({ }) => {
    const router = useRouter();
    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1

    // If string then cnovert to int else -1
    // Parsing to int because graphql is taking Input (id) arg as a  as a paramter 
    // -1 is so that one can skip or pause the queery
    const [{ data, error, fetching }] = usePostQuery(
        {
            variables: {
                id: intId
            }
        }
    )



    if (fetching) {
        return (
            <Layout>
                <Box>loading...</Box>
            </Layout>
        )
    }


    if (error) {
        return <div>{error.message}</div>
    }


    if (!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        );
    }


    return (

        <Layout>
            <h1> {data?.post?.title} </h1>

        </Layout>

    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
