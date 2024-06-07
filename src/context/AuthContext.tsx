import { ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react"
import { IPublicClientApplication } from "@azure/msal-browser";

type AuthProviderProps = {
    msalPca: IPublicClientApplication
    children: ReactNode
}

export const AuthProvider = ({ msalPca, children }: AuthProviderProps) => {

    return (
    <MsalProvider instance={msalPca}>
        {children}
    </MsalProvider>
    );
};
