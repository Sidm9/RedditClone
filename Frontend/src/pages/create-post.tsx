import { Box, Button, InputProps, Textarea } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';

import { toErrorMap } from '../utils/toErrorMap';


const CreatePost: React.FC<{}> = ({ }) => {
    // Use CreatePost Mutaion is a hook generated from the 
    // graph.tsx in graphql folder
    // --- all this is generated from graphql-code-generator ---
    // const [, createPost] = useCreatePostMutation();

    // For routing to other pages hook


    const router = useRouter();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    console.log(values)

                    // const { error } = await createPost({ input: values });
                    // if (!error) {
                    //     router.push("/");
                    // }


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
        </Wrapper>
    );
};


export default withUrqlClient(createUrqlClient)(CreatePost);