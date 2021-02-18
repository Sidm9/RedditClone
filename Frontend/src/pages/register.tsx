import { FormControl, FormLabel, Input, FormErrorMessage, Button, Box } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React from 'react'
import { useMutation } from 'urql'
import { InputField } from '../components/InputField'
import Wrapper from '../components/Wrapper'

interface registerProps { }

// THIS IS THE TEMPLATE FROM GRAPHQL PLAYGROUND
// $username and $password will be mapped directly down 
const REGISTER_MUT = `
mutation Register($username: String!, $password:String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`;

const Register: React.FC<registerProps> = ({ }) => {
    const [, register] = useMutation(REGISTER_MUT);
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values) => {
                    const response = await register(values);
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