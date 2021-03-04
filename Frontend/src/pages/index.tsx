import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import React from "react";
import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });
  return (

    <Layout>


      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="create-post">
          <Link ml="auto">
            Create Post
          </Link>
        </NextLink>
      </Flex>

      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
          <Stack spacing={8}>

            {data.posts.map((p) =>

              <Box key={p.id} p={5} shadow="md" borderWidth="1px">

                <Heading fontSize="xl">{p.title}</Heading>

                <div key={p.id}>{p.title}</div>

                <Text mt={4}>{p.textSnippet}...</Text>


              </Box>
            )}
          </Stack>

        )}

      {data ?

        (<Flex>
          <Button isLoading={fetching} m="auto" my={8}>Load More</Button>
        </Flex>)

        : null
      }
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);