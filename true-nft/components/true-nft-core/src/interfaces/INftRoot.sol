pragma ton-solidity >= 0.43.0;

interface INftRoot {
    function mintNft(string image, string metadata) external;
    function mintNftToUser(address owner, string image, string metadata) external;
    function getTotalMinted() external view responsible returns(uint256);
}
