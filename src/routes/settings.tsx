import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAccessToken, getAppData, setAccessToken as saveAccessToken, setAppData, getResourceGroup, setResourceGroup } from "@/models/store";
import { AccessToken, AppData, ResourceGroupName } from "@/models/models";

const Setting = () => {
    const { instance } = useMsal();
    const [storeResourceGroup, setStoreResourceGroup] = useState<ResourceGroupName>({ value: "" });
    const [accessToken, setAccessToken] = useState<AccessToken | null>(null);
    const [appsData, setAppsData] = useState<AppData>({ client_id: "", tenant_id: "" });
    const [saveBtnDisabled, setSaveBtnDisabled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = await getAccessToken();
            setAccessToken(token);

            const resourceGroup = await getResourceGroup();
            setStoreResourceGroup(resourceGroup);

            const data = await getAppData();
            if (data) {
                setAppsData(data);
            }
        };

        fetchData()
    }, []);

    const handleLogin = async (_: any) => {
        await instance.loginRedirect({
            scopes: [
                "https://management.azure.com/user_impersonation",
                "openid",
                "profile",
                "offline_access",
            ]
        });
    };

    const handleRevoke = async () => {
        const tempAccessToken: AccessToken = {
            value: "",
            created_at: Date.now(),
            expired_on: Date.now() + 3600 * 1000
        };
        setAccessToken(tempAccessToken);
        await saveAccessToken(tempAccessToken);
    };

    const reactiveRSN = async (value: string) => {
        await setResourceGroup({ value });
        setStoreResourceGroup({ value });
    };

    const handleSaveAppData = async () => {
        setSaveBtnDisabled(true);
        if (appsData.client_id.length > 0 && appsData.tenant_id.length > 0) {
            const appData: AppData = {
                client_id: appsData.client_id,
                tenant_id: appsData.tenant_id
            };
            await setAppData(appData);
            toast.success("App Data Saved!");
        } else {
            toast.error("Please fill in the client ID and tenant ID");
        }
        setTimeout(() => {
            setSaveBtnDisabled(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-y-1 h-full w-full p-6 justify-center">
            <div className="grid grid-cols-2 gap-4 w-full border border-accent rounded p-10">
                {/* App Data Form */}
                <div className="flex flex-col gap-2">
                    <Label className="w-full space-y-2 my-2">
                        <h1>Client ID</h1>
                        <Input className="w-full space-2 truncate" value={appsData.client_id} onChange={(e) => setAppsData({ ...appsData, client_id: e.target.value })} />
                    </Label>
                    <Label className="w-full space-y-2 my-2">
                        <h1>Tenant ID</h1>
                        <Input className="w-full space-2" value={appsData.tenant_id} onChange={(e) => setAppsData({ ...appsData, tenant_id: e.target.value })} />
                    </Label>
                    <Button disabled={saveBtnDisabled} size={'sm'} className="w-full space-2" onClick={handleSaveAppData}>Save</Button>
                </div>

                {/* App Data `How to get` */}
                <div className="flex gap-2 text-left">
                    <div>
                        <h1>Watch this video to get the Client ID and Tenant ID</h1>
                        <a href="https://youtu.be/0qZzcK1mHwA" target="_blank" rel="noreferrer">
                            <Button>Watch</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-4 w-full border border-grey-400 rounded p-10">
                <Label className="w-full space-y-2 my-2">
                    <h1>Access Token</h1>
                    <Input disabled className="w-[50%] space-2 truncate" value={accessToken?.value || ""} />
                    {accessToken && accessToken?.value.length > 0 || accessToken && accessToken?.expired_on < Date.now()
                        ? <Button variant="destructive" onClick={handleRevoke}>Revoke Access</Button>
                        : <Button onClick={handleLogin}>Get Access Token</Button>
                    }
                </Label>
                <Label className="w-full space-y-2 my-2">
                    <h1>Resource Groups</h1>
                    <Input className="w-[50%] space-2" defaultValue="" onChange={(e) => reactiveRSN(e.target.value)} />
                </Label>
            </div>

            <div className="flex flex-col gap-y-4 w-full border border-grey-400 rounded p-10">
                <Label className="w-full space-y-2 my-2">
                    <h1>Access Token</h1>
                    <Input disabled className="w-[50%] space-2 truncate" value={accessToken?.value || ""} />
                </Label>
                <Label className="w-full space-y-2 my-2">
                    <h1>Resource Group Name</h1>
                    <Input disabled className="w-[50%] space-2" value={storeResourceGroup.value} />
                </Label>
            </div>
        </div>
    );
};

export default Setting;