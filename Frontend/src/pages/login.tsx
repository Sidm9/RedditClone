import React from 'react';
import { Button, Box, Flex, Link } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link";

const Login: React.FC<{}> = ({ }) => {
    // Use Login Mutaion is a hook generated from the 
    // graph.tsx in graphql folder
    // --- all this is generated from graphql-code-generator ---
    const [, login] = useLoginMutation();

    // For routing to other pages hook
    const router = useRouter();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {

                    // The {options:property now expects a valueee }
                    // THIS IS FROM THE NEW MANNER OF GRAPQL QUERY WE ARE USING IT
                    // SLIGHTLY DIFFERENT FROM THE REGISTER.GRAPQHQL

                    const response = await login(values);
                    if (response.data?.login.errors) {
                        // SENGING THE ERROR MESSAGES TO ERROR MAP FILE IN UTILS
                        setErrors(toErrorMap(response.data.login.errors));
                    }
                    // IF USERNAME IS UNIQUE AND ALL CONDItIONS ARE MET
                    else if (response.data?.login.user) {
                        // WORKED

                        console.log(response.data);
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="Username or Email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>

                        <Flex mt={2}>
                            <NextLink href="/forgot-password">
                                <Link ml="auto">Forgot Password?</Link>
                            </NextLink>
                        </Flex>

                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Login
            </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Login);