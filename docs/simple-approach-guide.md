# 🚀 Simple True NFT guide (All data offchain)

In this example all data of NFT is served by your API

- 🖼️ Images stored on your own server
- 📋 Metadata accessed by your own 📄 API

## 1. Generate images and traits

- Install all dependencies
- Prepare your trait layers and put them in `image-sources` directory
- Modify `generator.ipynb` to add your traits and new layers. Also set number of images to generate.
- Run `generator.ipynb` to generate traits and NFT images. Images will be stored in `images-output` directory and traits in `metadata`

## 2. Upload images to your server or CDN

- In this example make sure all images are in `images-output` directory and the `api-server` is located next to this directory. Api server will serve this images.
- In future you should change the `IMAGES_BASE_URI` variable in `generator.ipynb` (from first step) to set your own server URL

## 3. Preapare metadata API Server

- Run `api-server-metadata-generator.ipynb` from "uploaders" directory. This script will put metdata link like "http://localhost:8080/token/{id}" for every your token. Change this link to your server URL
- Navigate to `api-server` directory: `cd api-server`
- Install all dependencies `yarn install`
- Make sure the first command updated "./data/all-metadatas.json" file. The server will try to get metadata from this file.
- Run server `yarn run start:dev`
- Open `http://localhost:8080/swagger`. It is ui for your API.

## 4. Deploy NFT collection to local network

You can test your collection on local machine. First make sure you have installed local blockchain in docker.

- Run `tondev se start`
- Navigate to "true-nft" directory: `cd true-nft`
- Run `yarn install`
- Run `lerna bootstrap`
- Test with `yarn run test-minter-ipfs`. This command will deploy sample collection to local network. 
- Deploy your generated collection with `yarn run deploy-minter`.
- If you have not created `.env` file in `./true-nft/components/true-nft-core`, then program will generate new MultiSig wallet. Its address and keys will be on screen. Better to create .env file and put there this address and keys to prevent generation of new wallet every time you run this command.
- Keys for this collection will be stored in `test-deploy-result.json` file.
- Copy this file into tnft-explorer for future step: `cp test-deploy-result.json ../tnft-explorer/src`

## 5. View your collection with `tnft-explorer`

![ducks](images/tnft-explorer-ducks.png)

- Navigate to "tnft-explorer" directory: `cd ../tnft-explorer`
- Run `yarn install`
- Make sure you have copied test-deploy-result.json file after deploying collection
- Run `yarn start` 
- Open http://localhost:3000/ in your browser 