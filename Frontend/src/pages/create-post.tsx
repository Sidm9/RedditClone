import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';


const CreatePost: React.FC<{}> = ({ }) => {

    // Use CreatePost Mutaion is a hook generated from the 
    // graph.tsx in graphql folder
    // --- all this is generated from graphql-code-generator ---
    const [, createPost] = useCreatePostMutation();

    // For routing to other pages hook
    const router = useRouter();
    
    useIsAuth();
    
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