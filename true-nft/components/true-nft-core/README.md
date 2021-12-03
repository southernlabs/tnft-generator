# TrueNft Core

Based on [TrueNFT Core](https://github.com/tonlabs/True-NFT/tree/main/components/true-nft-core)

Part of True NFT Generator

`Minter.sol` is responsible for minting (selling) NFTs
It stores future images and metadata


## Testing

```bash
yarn run compile
yarn run test
```

## Deploying

The deploy script is in `tests/deploy.test.ts` file. Use it to deploy collection.

Script loads NFT images and metadata from `../../../../metadata/all-metadatas.json`. Make sure this file exists.

⚠️ Create `.env` file with deployed MultiSig wallet's data (adress and keys). This wallet used to deploy Contracts to local, dev or main network. Make sure this wallet has enough balance (minimum 10 EVER).


__.env example__
```
NETWORK=LOCAL
MULTISIG_ADDRESS=0:5c5fc54acbd0e5257baec70bfa82665c8bdd56efdb90532558b600a2da933d28
MULTISIG_PUBKEY=2b036b4370ce5e893780a8418c4b7e038c5a1ad16ce9c7148696c3b03b353a4c
MULTISIG_SECRET=f6efab7e66caadcfa466b26c006985dc8cd3c29a411ecca7a576bd72bebba92b
```

Deploy

```bash
yarn run compile
yarn run deploy
```