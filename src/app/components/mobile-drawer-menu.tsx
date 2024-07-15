// import { useModal } from "connectkit";
// import { CountdownSmall } from "./countdown-sm";
import { Button, Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader } from "./ui";
import { useState } from "react";
import { useAccountEffect } from "wagmi";
import { useMobileMenuDrawer } from "../hooks";
import { NavLink } from "react-router-dom";
import { cn } from "../utils";
import { Referral } from "../utils/constants";
import { getReferralTreeByWallet } from "../utils/referrals";

export const MobileDrawerMenu = () => {
    // const { setOpen } = useModal();
    // const account = useAccount();
    // const getShortAccount = useCallback(
    //     (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    //     []
    // );
    const { isOpened, setOpened } = useMobileMenuDrawer();

    const [referralCode, setReferralCode] = useState('');
    const [referralTree, setReferralTree] = useState<Referral>();

    useAccountEffect({
        onConnect({ address, chainId }) {
            getReferralTreeByWallet(address, chainId)
                .then(referralTree => {
                    if (referralTree !== undefined) {
                        setReferralTree(referralTree);
                        setReferralCode(referralTree.referral as string);
                    }
                })
        },
        onDisconnect() {
            setReferralCode('');
            setReferralTree(undefined);
        },
    });

    return (
        <Drawer
            open={isOpened}
            onOpenChange={(open) => setOpened(open)}
            shouldScaleBackground
        >
            <DrawerContent className="outline-none border-0 bg-[rgb(19,19,19)] shadow-[0_0_50px_rgba(240,_46,_170,_0.7)]">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="flex flex-col gap-5 h-54">
                        {/* <DrawerTitle className="text-center text-[#ff00a4]">Presale end countdown</DrawerTitle>

                        <div className="inline-flex justify-center w-full">
                            <CountdownSmall size="lg" />
                        </div> */}

                        <div className="flex flex-col gap-2 text-white text-xl font-semibold text-center">
                            <NavLink 
                                to="/options"
                                className={cn(
                                    "rounded-lg h-full min-w-16 hover:bg-white/20 py-3"
                                )}
                            >
                                Buy
                            </NavLink>
                            <NavLink
                                to="/claim"
                                className={cn(
                                    "rounded-lg h-full min-w-16 hover:bg-white/20 py-3"
                                )}
                            >
                                Claim
                            </NavLink>
                            <NavLink
                                to="/dashboard"
                                className={cn(
                                    "rounded-lg h-full min-w-16 hover:bg-white/20 py-3",
                                    !referralTree ? 'hidden' : ''
                                )}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/referrals"
                                className={cn(
                                    "rounded-lg h-full min-w-16 hover:bg-white/20 py-3",
                                    !referralTree ? 'hidden' : ''
                                )}
                            >
                                Referrals ({referralCode.toUpperCase()})
                            </NavLink>
                        </div>
                    </DrawerHeader>



                    <DrawerFooter>
                        {/* <Button
                            onClick={() => setOpen(true)}
                            className="bg-[#ff00a4] hover:bg-[#75014c] rounded-lg text-xl font-semibold"
                        >
                            {account.isConnected ? getShortAccount(account.address) : 'Connect Wallet'}
                        </Button> */}

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
