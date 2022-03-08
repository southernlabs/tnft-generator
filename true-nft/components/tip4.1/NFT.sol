pragma ton-solidity >=0.55.0;

interface TIP4Nft {
    function getNftInfo() external responsible returns(uint128 id, address addrOwner, address addrManager, address addrCollection);
    function transferOwnership(address addrTo, address addrSendGasTo, mapping(address => CallbackParams) callbacks);
    function setManager(address addrManager, address addrSendGasTo, mapping(address => CallbackParams) callbacks);
    function getNftJsonContent() external responsible returns(string json);
}

struct CallbackParams {
    uint256 value;      // ever value will send to address
    TvmCell payload;
}

interface ITokenTransferCallback {
    function tokenTransferCallback(
        uint256 id,
        address addrOldOwner,
        address addrOldManager,
        address addrNewOwner,
        address addrCollection,
        address addrSendGasTo,
        TvmCell payload
    ) external;
}

interface ISetManagerCallback {
    function setManagerCallback(
        uint256 id,
        address addrOwner,
        address addrOldManager,
        address addrNewManager,
        address addrCollection,
        address addrSendGasTo,
        TvmCell payload
    ) external;
}

event TokenWasMinted(address owner);
event OwnershipTransferred(address oldOwner, address newOwner);
event ManagerChanged(address oldManager, address newManager);



