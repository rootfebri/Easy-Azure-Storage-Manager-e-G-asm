import {useState} from 'react';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Button} from "@/components/ui/button";
import {CircleCheckBig, Copy, ExternalLink} from "lucide-react";

const UrlComponent = ({url}: { url: string; }) => {
    const [isCopying, setIsCopying] = useState(false);
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant="link">
                    <div className="font-normal truncate max-w-40">{url}</div>
                </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit flex items-center gap-x-2 text-sm">
                <Button variant={'secondary'} disabled={isCopying} type={'button'} onClick={() => {
                    navigator.clipboard.writeText(url)
                        .then(() => setIsCopying(true))
                        .catch(() => setIsCopying(false))
                        .finally(() => setTimeout(() => setIsCopying(false), 1000));
                }}>
                    {isCopying ? <CircleCheckBig size={12}/> : <Copy size={12}/>}
                </Button>
                <a href={url} target={'_blank'}>
                    <Button variant={'secondary'} type={'button'}>
                        <ExternalLink size={12}/>
                    </Button>
                </a>
            </HoverCardContent>
        </HoverCard>
    )
        ;
};

export default UrlComponent;
