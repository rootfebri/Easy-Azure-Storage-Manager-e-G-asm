import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useIsAuthenticated, useMsal} from "@azure/msal-react"
import {getAccessToken, getActiveRSN, setAccessToken, setActiveRSN,} from "@/lib/utils.ts"
import {useEffect, useState} from "react";

const Setting = () => {
    const isAuthenticated = useIsAuthenticated()
    const {instance} = useMsal()
    const [rcGetActiveRSN, setRCActiveRSN] = useState<string>(getActiveRSN())

    const handleLogin = async (_: any) => {
        await instance.loginRedirect({
            scopes: [
                "https://management.azure.com/user_impersonation",
                "openid",
                "profile",
                "offline_access",
            ]}
        )
    }
    const handleRevoke = async () => {
        setAccessToken("")
        await instance.logoutRedirect()
    }

    useEffect(() => {
        setRCActiveRSN(rcGetActiveRSN)
        setActiveRSN(rcGetActiveRSN)
    }, [rcGetActiveRSN]);

    return (
        <div className="flex flex-col gap-y-1 h-full w-full p-6 justify-center">
            <div className="flex flex-col gap-y-4 w-full border border-grey-400 rounded p-10">
                <Label className="w-full space-y-2 my-2">
                    <h1>Access Token</h1>
                    <Input disabled className="w-[50%] space-2 truncate" value={getAccessToken() || ""}/>
                    {!isAuthenticated
                        ? <Button onClick={handleLogin}>Get Access Token</Button>
                        : <Button variant="destructive" onClick={handleRevoke}>Revoke Access</Button>
                    }
                </Label>
                <Label className="w-full space-y-2 my-2">
                    <h1>Resource Groups</h1>
                    <Input className="w-[50%] space-2" value={rcGetActiveRSN || ""} onChange={(e) => setRCActiveRSN(e.target.value)}/>
                </Label>
            </div>

            <div className="flex flex-col gap-y-4 w-full border border-grey-400 rounded p-10">
                <Label className="w-full space-y-2 my-2">
                    <h1>Access Token</h1>
                    <Input disabled className="w-[50%] space-2 truncate" value={getAccessToken() || ""}/>
                </Label>
                <Label className="w-full space-y-2 my-2">
                    <h1>Resource Group Name</h1>
                    <Input disabled className="w-[50%] space-2" value={rcGetActiveRSN || getActiveRSN() || ""}/>
                </Label>
            </div>
        </div>
    )
}

export default Setting
