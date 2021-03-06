import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { Layout } from '../../components/Layout'
import { Box, Heading } from '@chakra-ui/core'
import { usePostQuery } from '../../generated/graphql'
import { useGetIntId } from '../../utils/useGetIntId'
import { EditDeletePostButtons } from '../../components/EditDeletePostButton'

const Post = ({ }) => {

  const intId = useGetIntId();
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (loading) {
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
      <Box mt={4}>
        <EditDeletePostButtons
          id={data.post.id}
          creatorId={data.post.creator.id}
        />
      </Box>
    </Layout>

  )
}

export default Post;
