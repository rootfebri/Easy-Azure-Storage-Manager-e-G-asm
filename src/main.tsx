import React from "react"
import ReactDOM from "react-dom/client"
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import "@/App.css"
import Error from "@/error"
import Layout from "@/layout"
import Home from "@/routes/home.tsx"
import Setting from "@/routes/settings.tsx"
import {ThemeProvider} from "@/provider/theme.tsx"
import {AuthProvider} from "./context/AuthContext"
import {EventType, PublicClientApplication} from "@azure/msal-browser"
import {setAccessToken} from "./lib/utils"

const pca = new PublicClientApplication({
    auth: {
        clientId: import.meta.env.VITE_APPLICATION_CLIENT_ID as string,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_APPLICATION_TENANT_ID}`,
        redirectUri: '/',
    },
})

pca.addEventCallback(e => {
    if (e.eventType === EventType.LOGIN_SUCCESS) {
        // @ts-ignore
        pca.setActiveAccount(e.payload.account)
        // @ts-ignore
        setAccessToken(e.payload.accessToken)
    }
})

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <Error/>,
        children: [
            {
                index: true,
                element: <Home/>,
            },
            {
                path: "/settings",
                element: <Setting/>,
            },
        ],
    },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider msalPca={pca}>
                <RouterProvider router={router}/>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
)

