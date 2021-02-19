import React from 'react';
import { Button, Box } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router';
interface registerProps { }

const Register: React.FC<registerProps> = ({ }) => {
    // Use Register Mutaion is a hook generated from the 
    // graph.tsx in graphql folder
    // --- all this is generated from graphql-code-generator ---
    const [, register] = useRegisterMutation();

    // For routing to other pages hook
    const router = useRouter();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register(values);
                    if (response.data?.register.errors) {
                        // SENGING THE ERROR MESSAGES TO ERROR MAP FILE IN UTILS
                        setErrors(toErrorMap(response.data.register.errors));
                    }
                    // IF USERNAME IS UNIQUE AND ALL CONDItIONS ARE MET
                    else if (response.data?.register.user) {
                        // WORKED

                        console.log(response.data);
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            colorScheme="teal"
                        >
                            Register
            </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Register;