# 🚀 Simple True NFT guide (All data offchain)

- 🖼️ Images stored on your own server
- 📋 Metadata accessed by your own 📄 API

## 1. Generate images and traits

- Install all dependencies
- Prepare your trait layers and put them in `image-sources` directory
- Modify `generator.ipynb` to add your traits and new layers. Also set number of images to generate.
- Run `generator.ipynb` to generate traits and NFT images. Images will be stored in `images-output` directory and traits in `metadata`

## 2. Upload images to your server or CDN

?? TODO ??

## 3. Preapare metadata API Server

?? TODO ??

## 4. Deploy NFT collection to local network

You can test your collection on local machine. First make sure you have installed local blockchain in docker.

- Run `tondev se start`
- Navigate to "true-nft" directory: `cd true-nft`
- Run `yarn install`
- Run `lerna bootstrap`
- Test with `yarn run test-minter-ipfs`

## 5. View your collection with `tnft-explorer`

- Navigate to "tnft-explorer" directory: `cd tnft-explorer`
- Run `yarn install`
- ???
- Run `yarn start`
- Open http://localhost:3000/ in your browser