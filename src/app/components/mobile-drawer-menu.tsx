import { useModal } from "connectkit";
import { CountdownSmall } from "./countdown-sm";
import { Button, Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "./ui";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useMobileMenuDrawer } from "../hooks";

export const MobileDrawerMenu = () => {
    const { setOpen } = useModal();
    const account = useAccount();
    const getShortAccount = useCallback(
        (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
        []
    );
    const { isOpened, setOpened } = useMobileMenuDrawer();


    return (
        <Drawer
            open={isOpened}
            onOpenChange={(open) => setOpened(open)}
            shouldScaleBackground
        >
            <DrawerContent className="outline-none border-0 bg-[rgb(19,19,19)] shadow-[0_0_50px_rgba(240,_46,_170,_0.7)]">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="flex flex-col gap-5 h-44">
                        <DrawerTitle className="text-center text-[#ff00a4]">Presale end countdown</DrawerTitle>
                        
                        <div className="inline-flex justify-center w-full">
                            <CountdownSmall size="lg" />
                        </div>
                    </DrawerHeader>
                    
                    <DrawerFooter>
                        <Button
                            onClick={() => setOpen(true)}
                            className="bg-[#ff00a4] hover:bg-[#75014c] rounded-lg text-xl font-semibold"
                        >
                            {account.isConnected ? getShortAccount(account.address) : 'Connect Wallet'}
                        </Button>

                        <DrawerClose asChild>
                            <Button
                                variant="outline"
                                className="rounded-lg text-xl font-semibold"
                            >
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
