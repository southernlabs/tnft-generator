pragma ton-solidity >=0.43.0;

interface TIP4Nft {
    function getNftInfo() external responsible returns(uint128 id, address addrOwner, address addrManager, address addrCollection);
    function transferOwnership(address addrTo, address addrSendGasTo, mapping(address => CallbackParams) callbacks);
    function setManager(address addrManager, address addrSendGasTo, mapping(address => CallbackParams) callbacks);
    function getNftJsonContent() external responsible returns(string json);
}