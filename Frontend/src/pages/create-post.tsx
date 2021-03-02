import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';


const CreatePost: React.FC<{}> = ({ }) => {

    // Use CreatePost Mutaion is a hook generated from the 
    // graph.tsx in graphql folder
    // --- all this is generated from graphql-code-generator ---
    const [{ data, fetching }] = useMeQuery();
    const [, createPost] = useCreatePostMutation();

    // For routing to other pages hook
    const router = useRouter();


    // IF NOT LOGGED IN THEN REDIRECT TO LOGIN PAGE
    useEffect(() => {
        if (!data?.me) {
            router.replace("/login")
        }
    }, [fetching, data, router])



    return (
        <Layout variant='small'>
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    console.log(values)

                    await createPost({ input: values });
                    router.push("/");
                    const { error } = await createPost({ input: values });
                    if (error) {
                        console.log("error :", error);
                    }


                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="Title"
                            label="Title"
                        />

                        <Box mt={4} />

                        <InputField
                            textarea
                            name="text"
                            placeholder="text..."
                            label="Body"
                        />



                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Create Post
            </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};


export default withUrqlClient(createUrqlClient)(CreatePost);