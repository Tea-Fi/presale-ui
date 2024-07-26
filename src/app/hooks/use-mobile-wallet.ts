import {isMobile} from 'react-device-detect';

export const useConnectedWalletMobile = () => {
    
    const open = () => {
        const ethereum = window.ethereum;
        if(isMobile && !ethereum) {
            return window.open("https://metamask.app.link");
        }

        return null;
    }

    return {
        open
    }
}