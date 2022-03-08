pragma ton-solidity >=0.55.0;

interface TIP4NftCollection {
    function name() public view responsible returns (string);
    function totalSupply() public view responsible returns (uint128);
    function maxSupply() public view responsible returns (uint128);
    function nftCode() public view responsible returns (TvmCell);
}

event nftCreated(
    uint256 id,           // nft token id
    address addrNft,      // nft token address
    address addrOwner,    // nft token owner
    address addrCreator   // initiator of creating the nft token
);