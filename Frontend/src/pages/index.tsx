import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import React, { useState } from "react";
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/core";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { UpdootSection } from "../components/UpdootSection";

const Index = () => {

  const [variables, setVariables] = useState({ limit: 33, cursor: null as null | string })
  const [, deletePost] = useDeletePostMutation();
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });


  if (!fetching && !data) {
    return <div>
      Something is definitely not right
    </div>
  }

  return (

    <Layout>
      {!data && fetching ? (
        <div>loading..</div>
      ) : (
        <Stack spacing={8}>
          {/* if p is null then it will return null  +  Protecting from null */}
          {data!.posts.posts.map((p) => !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                </NextLink>
                <Text>posted by {p.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>
                    {p.textSnippet}
                  </Text>
                  <IconButton
                    ml="auto"
                    variantColor="red"
                    icon="delete"
                    aria-label="Delete Post"
                    onClick={() => {
                      deletePost({ id: p.id });
                    }}

                  />
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);