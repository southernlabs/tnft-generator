const { compile } = require("@ton-contracts/compiler");

//compile(["Index", "Data", "NftRoot", "IndexBasis", "Wrapper", "CryptoNeuralWaifu", "CryptoWaifuWallet"]);

compile(["Index", "Data", "NftRoot", "IndexBasis", "Minter"]);
