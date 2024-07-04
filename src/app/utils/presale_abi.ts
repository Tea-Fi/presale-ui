export const PRESALE_ABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_multisigWallet",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_uniswapRouterV2",
                "type": "address",
                "internalType": "contract IUniswapV2Router02"
            },
            {
                "name": "tokensAvailableForPresale",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "options",
                "type": "tuple[]",
                "internalType": "struct Presale.Option[]",
                "components": [
                    {
                        "name": "tgeAmount",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "leftoverVesting",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "price",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "presaleToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "sold",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "soldInUsd",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "DELTA_PRESALE_TOKEN_PRICE_SCALE_DIVISOR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MULTISIG_WALLET",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "TOKENS_AVAILABLE_FOR_PRESALE",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "addPaymentToken",
        "inputs": [
            {
                "name": "peggedToUsd",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "path",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "buyExactPresaleTokens",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "referrerId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "tokenSell",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "buyAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "buyExactPresaleTokensETH",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "referrerId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "buyAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "createNewOption",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "tgeAmount",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "leftoverVesting",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "price",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "deleteOption",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getExactPayAmount",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "tokenSell",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "buyAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getExactReceiveAmount",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "tokenSell",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "payAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getOptionInfo",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct Presale.Option",
                "components": [
                    {
                        "name": "tgeAmount",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "leftoverVesting",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "price",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "presaleToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "sold",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "soldInUsd",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initOptions",
        "inputs": [
            {
                "name": "optionIds",
                "type": "uint8[]",
                "internalType": "uint8[]"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "inputPriceQuote",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountsIn",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "referrals",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "referrals",
                "type": "uint16",
                "internalType": "uint16"
            },
            {
                "name": "sold",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "soldInUsd",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "removePaymentToken",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "saleOptions",
        "inputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [
            {
                "name": "tgeAmount",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "leftoverVesting",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "price",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "presaleToken",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "sold",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "soldInUsd",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "saleOptionsCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "salePaymentTokens",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "peggedToUsd",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "allowed",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalSold",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalSoldInUsd",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "unpause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "AddPaymentToken",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "BuyTokens",
        "inputs": [
            {
                "name": "buyer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenSold",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "presaleToken",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "optionId",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "referrerId",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "tokensSoldAmountInUsd",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenSoldAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenSoldPrice",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenReceivedPrice",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenReceivedAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OptionCreated",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "indexed": true,
                "internalType": "uint8"
            },
            {
                "name": "presaleToken",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "price",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OptionDeleted",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "indexed": true,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Paused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PresaleTokenCreated",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RemovePaymentToken",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdraw",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AddressEmptyCode",
        "inputs": [
            {
                "name": "target",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "AddressInsufficientBalance",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "AddressMustBeDifferentFromAddressZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "EnforcedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ExpectedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FailedInnerCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InsufficientFunds",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotEnoughTokensLeftPerOption",
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "available",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "OptionCreationIsOverflow",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OptionIsAlreadyCreated",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OptionNotCreated",
        "inputs": [
            {
                "name": "optionId",
                "type": "uint8",
                "internalType": "uint8"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "PaymentTokenAlreadyAuthorized",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "PaymentTokenNotAuthorized",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "WithdrawFailed",
        "inputs": []
    }
];