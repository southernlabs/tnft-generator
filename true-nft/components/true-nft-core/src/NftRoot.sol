pragma ton-solidity >=0.43.0;

pragma AbiHeader expire;
pragma AbiHeader time;

import './resolvers/IndexResolver.sol';
import './resolvers/DataResolver.sol';

import './IndexBasis.sol';

import './interfaces/IData.sol';
import './interfaces/IIndexBasis.sol';

contract NftRoot is DataResolver, IndexResolver {

    uint256 _totalMinted;
    address _addrBasis;

    uint256 public adminPubkey;
    address adminAddress;

    uint256 public totalSupply = 2048;


    modifier onlyAdmin() {
        require( (msg.pubkey() == adminPubkey) || (msg.sender == adminAddress), 100);
        tvm.accept();
        _;
    }

    constructor(TvmCell codeIndex, TvmCell codeData) public {
        tvm.accept();
        _codeIndex = codeIndex;
        _codeData = codeData;
        adminPubkey = msg.pubkey();
    }

    function mintNft(string image, string metadata) public onlyAdmin {
        require(_totalMinted <= totalSupply, 301);

        TvmCell codeData = _buildDataCode(address(this));
        TvmCell stateData = _buildDataState(codeData, _totalMinted);
        new Data{stateInit: stateData, value: 1.1 ton}(msg.sender, _codeIndex, image, metadata);
       
        _totalMinted++;
    }

    function mintNftToUser(address owner, string image, string metadata) public onlyAdmin {
        require(_totalMinted <= totalSupply, 301);

        TvmCell codeData = _buildDataCode(address(this));
        TvmCell stateData = _buildDataState(codeData, _totalMinted);
        new Data{stateInit: stateData, value: 1.1 ton}(owner, _codeIndex, image, metadata);
       
        _totalMinted++;
    }

    function getTotalMinted() public view returns(uint256){
        return _totalMinted;
    }

    function transferAdmin(uint256 _newAdminPubkey, address _newAdminAddress) public onlyAdmin {
        adminPubkey = _newAdminPubkey;
        adminAddress = _newAdminAddress;
    }

    function sendTransaction(address dest, uint128 value, bool bounce, uint8 flags, TvmCell payload) public onlyAdmin {
        dest.transfer(value, bounce, flags, payload);
    }

    function deployBasis(TvmCell codeIndexBasis) public {
        require(msg.value > 0.5 ton, 104);
        uint256 codeHasData = resolveCodeHashData();
        TvmCell state = tvm.buildStateInit({
            contr: IndexBasis,
            varInit: {
                _codeHashData: codeHasData,
                _addrRoot: address(this)
            },
            code: codeIndexBasis
        });
        _addrBasis = new IndexBasis{stateInit: state, value: 0.4 ton}();
    }

    function destructBasis() public view {
        IIndexBasis(_addrBasis).destruct();
    }
}