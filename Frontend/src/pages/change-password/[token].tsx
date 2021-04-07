import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import NextLink from "next/link";
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = () => {

    const router = useRouter();

    const [changePassword] = useChangePasswordMutation();

    // FOR HANDLING THE EDGE CASE HOOK (WHEN TOKEN IS MISSING)
    const [tokenError, setTokenError] = useState("");

    return (
        <>
            <Wrapper variant="small">
                <Formik
                    initialValues={{ newPassword: "" }}
                    onSubmit={async (values, { setErrors }) => {

                        // The {options:property now expects a valueee }
                        // THIS IS FROM THE NEW MANNER OF GRAPQL QUERY WE ARE USING IT
                        // SLIGHTLY DIFFERENT FROM THE REGISTER.GRAPQHQL

                        const response = await changePassword({
                            variables: {
                                newPassword: values.newPassword,
                                token:
                                    typeof router.query.token === "string" ? router.query.token : "",
                            }
                        }); // Token can come from the router tooo..... if " " then ERRORR!
                        if (response.data?.changePassword.errors) {
                            const errorMap = toErrorMap(response.data.changePassword.errors)
                            // SENGING THE ERROR MESSAGES TO ERROR MAP FILE IN UTILS

                            if ('token' in errorMap) {
                                setTokenError(errorMap.token);
                            }

                            setErrors(errorMap);
                            setErrors(toErrorMap(response.data.changePassword.errors));
                        }
                        // IF USERNAME IS UNIQUE AND ALL CONDItIONS ARE MET
                        else if (response.data?.changePassword.user) {
                            // WORKED

                            console.log(response.data);
                            router.push("/");
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="newPassword"
                                placeholder="new password"
                                label="New Password"
                                type="password"
                            />
                            {tokenError ? (
                                <Flex>
                                    <Box mr={2} style={{ color: "red" }}>
                                        {tokenError}
                                    </Box>
                                    <NextLink href="/forgot-password">
                                        <Link>click here to get a new one</Link>
                                    </NextLink>
                                </Flex>
                            ) : null}
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                change password
            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </>
    )
}

export default ChangePassword;
