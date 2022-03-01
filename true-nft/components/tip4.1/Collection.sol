pragma ton-solidity >=0.43.0;

interface TIP4NftCollection {
    function name() public view responsible returns (string);
    function totalSupply() public view responsible returns (uint128);
    function maxSupply() public view responsible returns (uint128);
    function nftCode() public view responsible returns (TvmCell);
}