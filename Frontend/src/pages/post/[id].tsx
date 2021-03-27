import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { Layout } from '../../components/Layout'
import { Box, Heading } from '@chakra-ui/core'
import { usePostQuery } from '../../generated/graphql'
import { useGetIntId } from '../../utils/useGetIntId'

const Post = ({ }) => {

  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
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
            <Heading mb={4} > {data?.post?.title} </Heading>
            <h1> {data?.post.text} </h1>

        </Layout>

    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
