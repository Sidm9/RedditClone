import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/core';
import { useField } from 'formik'
import React from 'react'

// TEMPLATE WRAPPER FOR AUTHENTICATION 

// & means taking 2 params {1. For Ts Types , 2. For our custom commponent}
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
};

// '' => false
// 'error message stuff' => true

export const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    let InputOrTextarea = Input;
    if (textarea) {
        InputOrTextarea = Textarea;
    }
    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

