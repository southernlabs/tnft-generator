import { KeyPair, TonClient } from "@tonclient/core";
import { createClient } from "@ton-contracts/utils/client";
import TonContract from "@ton-contracts/utils/ton-contract";
import { callThroughMultisig } from "@ton-contracts/utils/net";
import pkgSafeMultisigWallet from "../../../ton-packages/SetCodeMultisig.package"
import pkgNftRoot from "../ton-packages/NftRoot.package";
import pkgData from "../ton-packages/Data.package";
import pkgIndex from "../ton-packages/Index.package";
import pkgMinter from "../ton-packages/Minter.package";
import { expect } from "chai";

import {get_tokens_from_giver} from './giver.module';

describe("Deploy", () => {
  let client: TonClient;
  let smcSafeMultisigWallet: TonContract;
  let smcNftRoot: TonContract;
  let smcMinter: TonContract;
  let smcNft: TonContract;
  let smcData: TonContract;
  let myDeployedNft = 0;
  let fakeAddress = "0:0000000000000000000000000000000000000000000000000000000000001111";
  let keys: KeyPair;
  let msigKeys: KeyPair;
  let metadatas_json: Array<Object>;
  let ipfs_images = {};
  let ipfs_metadatas = {};

  before(async () => {
    if(process.env.MULTISIG_ADDRESS){
      client = createClient();
      smcSafeMultisigWallet = new TonContract({
        client,
        name: "SafeMultisigWallet",
        tonPackage: pkgSafeMultisigWallet,
        address: process.env.MULTISIG_ADDRESS,
        keys: {
          public: process.env.MULTISIG_PUBKEY,
          secret: process.env.MULTISIG_SECRET,
        },
      });
    }
	
	// Semi-manual msig deploy, for test network
	if(!process.env.MULTISIG_ADDRESS){
    client = createClient("http://localhost");
    msigKeys = await client.crypto.generate_random_sign_keys();
    smcSafeMultisigWallet = new TonContract({
      client,
      name: "SafeMultisigWallet",
      tonPackage: pkgSafeMultisigWallet,
      keys: msigKeys,
    });
		await smcSafeMultisigWallet.calcAddress();

		console.log(`🟡 You are running without specified msig address and keys. Generating msig automatically...`);

		console.log(`Msig address: ${smcSafeMultisigWallet.address}`);
		console.log(`Msig keys: `,msigKeys);
		
    // Here freezee to wait for balance
    let msigBalance = await smcSafeMultisigWallet.getBalance()

    get_tokens_from_giver(client, smcSafeMultisigWallet.address, 1_000_000_000_000_000)

    console.log(`Msig balance: ${msigBalance}`);
    console.log(` ⚠️ Topup msig balance via tondev:  tondev ct -a ${smcSafeMultisigWallet.address} -v 1000000000000000`);

    while(!await smcSafeMultisigWallet.getBalance()){}
		//expect(msigBalance).not.to.be.equal(0);

    //deploy new msig
		await smcSafeMultisigWallet.deploy({
		  input: {
        owners: ["0x"+msigKeys.public],
        reqConfirms: 1,
		  },
		});
	}
  });

  it("Get metadata", async () => {
    metadatas_json = require("../../../../metadata/all-metadatas.json");
    expect(metadatas_json).to.be.ok;
  })

  it("Parse metadata", async () => {
    //console.log(metadatas_json);
    metadatas_json.forEach( (e: any) => {
        ipfs_images[e.tokenId] = e.image;
        ipfs_metadatas[e.tokenId] = e.metadata;
    });
    //console.log(ipfs_images);
  })

  it("deploy NftRoot", async () => {
    keys = await client.crypto.generate_random_sign_keys();

    smcNftRoot = new TonContract({
      client,
      name: "NftRoot",
      tonPackage: pkgNftRoot,
      keys,
    });
    await smcNftRoot.calcAddress();
    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {
        dest: smcNftRoot.address,
        value: 15_000_000_000,
        bounce: false,
        flags: 2,
        payload: "",
      },
    });

    console.log(`NftRoot address: ${smcNftRoot.address}`);

    await smcNftRoot.deploy({
      input: {
        codeIndex: (
          await client.boc.get_code_from_tvc({ tvc: pkgIndex.image })
        ).code,
        codeData: (
          await client.boc.get_code_from_tvc({ tvc: pkgData.image })
        ).code,
      },
    });

    const res = (
      await client.net.query_collection({
        collection: "accounts",
        filter: {
          id: { eq: smcNftRoot.address },
        },
        result: "acc_type",
      })
    ).result[0];

    expect(1).to.be.equal(res.acc_type);

    console.log("Root keys: ", keys);
  });

  it("deploy Minter", async () => {
    smcMinter = new TonContract({
      client,
      name: "Minter",
      tonPackage: pkgMinter,
      keys,
    });
    await smcMinter.calcAddress();

    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {
        dest: smcMinter.address,
        value: 5_000_000_000,
        bounce: false,
        flags: 2,
        payload: "",
      },
    });

    console.log(`Minter address: ${smcMinter.address}`);

    await smcMinter.deploy({
      input: {
        addrRoot: smcNftRoot.address,
        images: ipfs_images,
        metadatas: ipfs_metadatas,
      },
    });

    const res = (
      await client.net.query_collection({
        collection: "accounts",
        filter: {
          id: { eq: smcMinter.address },
        },
        result: "acc_type",
      })
    ).result[0];

    expect(1).to.be.equal(res.acc_type);

    // Set Minter address to root
    await smcNftRoot.call({
      functionName: "transferAdmin",
      input: {
        _newAdminPubkey: "0x"+keys.public,
        _newAdminAddress: smcMinter.address
      },
      keys
    });
    
  });

  it("Save the deploy data", async () => {
    const result = {
      Root: {
        address: smcNftRoot.address,
        keys: smcNftRoot.keys
      },
      Minter:{
        address: smcMinter.address,
        keys: smcMinter.keys
      },
      Msig:{
        address:smcSafeMultisigWallet.address,
        keys:smcSafeMultisigWallet.keys
      },
      network: "127.0.0.1"
    }

    var json = JSON.stringify(result);
    var fs = require('fs');
    fs.writeFileSync('../../test-deploy-result.json', json);

    console.log("Test data saved to test-deploy-result.json please use this file to configure tnft-explorer");
  });
 
});