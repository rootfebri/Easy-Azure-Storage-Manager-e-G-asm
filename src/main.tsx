import "@/App.css"
import Error from "@/error"
import Layout from "@/layout"
import { ThemeProvider } from "@/provider/theme.tsx"
import Home from "@/routes/home.tsx"
import Setting from "@/routes/settings.tsx"
import { EventType, PublicClientApplication } from "@azure/msal-browser"
import { restoreStateCurrent, saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state"
import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { AccessToken } from "@/models/models"
import { setAccessToken as saveAccessToken } from "@/models/store"
import { getAppData } from "@/models/store";
import HandleSetup from "@/HandleSetup"

(async () => {
    saveWindowState(StateFlags.ALL)
    restoreStateCurrent(StateFlags.ALL)

    const appData = await getAppData();

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            errorElement: <Error />,
            children: [
                {
                    index: true,
                    element: appData?.client_id ? <Home /> : <HandleSetup />,
                },
                {
                    path: "/settings",
                    element: <Setting />,
                },
            ],
        },
    ])

    const pca = new PublicClientApplication({
        auth: {
            clientId: appData?.client_id || "",
            authority: `https://login.microsoftonline.com/${appData?.tenant_id || ""}`,
            redirectUri: '/',
        },
    });

    // Tambahkan callback dan konfigurasi lainnya di sini
    pca.addEventCallback(e => {
        if (e.eventType === EventType.LOGIN_SUCCESS) {
            // @ts-ignore
            pca.setActiveAccount(e.payload?.account)
            saveAccessToken({
                // @ts-ignore
                value: e.payload?.accessToken,
                created_at: Date.now(),
                expired_on: Date.now() + 3600 * 1000
            } as AccessToken)
        }
    });

    // Render aplikasi dengan pca yang sudah dikonfigurasi
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        <React.StrictMode>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <AuthProvider msalPca={pca}>
                    <RouterProvider router={router} />
                </AuthProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
})();
