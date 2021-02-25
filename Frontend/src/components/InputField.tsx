import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/core';
import { useField } from 'formik'
import React from 'react'


// & means taking 2 params {1. For Ts Types , 2. For our custom commponent}
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
};


export const InputField: React.FC<InputFieldProps> = ({ label, size: _, ...props }) => {
    const [field, { error }] = useField(props);

    return (
        // !! is typecasting to a boolean
        <FormControl isInvalid={!!error}>

            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <Input {...field} {...props} id={field.name}
            //  placeholder={props.placeholder} 
                />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
}

