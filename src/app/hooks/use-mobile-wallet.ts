import {isMobile} from 'react-device-detect';

export const useConnectedWalletMobile = () => {
    
    const open = () => {
        if(isMobile) {
            return window.open("https://metamask.app.link");
        }

        return null;
    }

    return {
        open
    }
}