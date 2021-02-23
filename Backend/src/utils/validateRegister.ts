import { UsernamePasswordInput } from "../resolveres/UsernamePasswordInput";


export const validateRegister = (options: UsernamePasswordInput) => {



    if (!options.email.includes('@')) {
        return
        [
            {
                field: "email",
                message: "Invalid Email",
            }
        ];
    }



    if (options.username.length <= 2) {
        return
        [
            {
                field: "username",
                message: "Length must be greater than 2",
            }
        ];

    }


    if (!options.username.includes('@')) {
        return
        [
            {
                field: "username",
                message: "Cannot include an @ sign",
            }
        ];

    }


    if (options.password.length <= 2) {
        return
        [
            {
                field: "password",
                message: "Length must be greater than 2",
            }
        ];

    }

    // If none of these things happen then no error...
    return null;

}