import React from 'react';
import Navbar from './navbar';
import Wrapper, { WrapperVariant } from './Wrapper';

interface LayoutProps {
    variant?: WrapperVariant // Better Praactise
};

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {


    return (
        <>
            <Navbar />
            <Wrapper variant={variant}>

                {children}
            </Wrapper>

        </>
    );
}