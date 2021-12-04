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

describe("main test", () => {
  let client: TonClient;
  let smcSafeMultisigWallet: TonContract;
  let smcNftRoot: TonContract;
  let smcMinter: TonContract;
  let smcData: TonContract;
  let fakeAddress = "0:0000000000000000000000000000000000000000000000000000000000001111";
  let keys: KeyPair;
  let msigKeys: KeyPair;
  let myDeployedNft: number;

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

  it("deploy first NftRoot", async () => {
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
        value: 10_000_000_000,
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
        value: 10_000_000_000,
        bounce: false,
        flags: 2,
        payload: "",
      },
    });

    console.log(`Minter address: ${smcMinter.address}`);

    await smcMinter.deploy({
      input: {
        addrRoot: smcNftRoot.address,
        images: {0: "https://gateway.pinata.cloud/ipfs/QmRSTurySshBxQPxpB2M4TQMwAL3YzetstKbMeJkTGBfvS",
         1: "https://gateway.pinata.cloud/ipfs/QmQFVa7YJ1NEgXdzazqHaBAQBZYi7anUpEixfZNcjnbkhK",
         2: "https://gateway.pinata.cloud/ipfs/QmfSgYbrGyCDK2k4sHE1mWakckaahzn7iKuzsCojBSfJC8",
         3: "https://gateway.pinata.cloud/ipfs/QmNTb2gFHRGFoukK62kygAws9Uta8FsdwJ2ShiQBLiLWTm"},
        metadatas: {0: "https://gateway.pinata.cloud/ipfs/QmRGNnwk2LKCLxTpjUYXHRSNCYvd53abLfjma2LwyY3gYt",
         1: "https://gateway.pinata.cloud/ipfs/QmRm1273Y9JdaLBVGCg56WKu62zVm1Th9Ks8fe6iCaTGyC",
         2: "https://gateway.pinata.cloud/ipfs/QmV4NanazYAAqzDctkkwKHx2NbdbVAaqS2jom18FcQWsz1",
         3: "https://gateway.pinata.cloud/ipfs/QmV3GNnyxBFNPBANB5UpReFMhdh1T471PVtBbj8K4ZDQn1"},
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


  it("Mint Nft from Minter", async () => {
    await callThroughMultisig({
      client,
      smcSafeMultisigWallet,
      abi: pkgMinter.abi,
      functionName: "mintNft",
      input: {},
      dest: smcMinter.address,
      value: 2_500_000_000,
    });

    smcData = await getAddrData(
      client,
      smcNftRoot,
      smcSafeMultisigWallet
    );
    console.log(`Data address: `, smcData.address);

    let metadata = await smcData.run({
      functionName: "getMeta"
    });
	  console.log("Metadata", metadata.value);

    let res = await smcData.run({
      functionName: "getInfo"
    });
    myDeployedNft++;
	
	  console.log("res", res.value);
    
    expect(smcNftRoot.address).to.be.equal(res.value.addrRoot);
    expect(smcSafeMultisigWallet.address).to.be.equal(res.value.addrOwner);
  });

  it("transfer ownership", async () => {
    await callThroughMultisig({
      client,
      smcSafeMultisigWallet,
      abi: pkgData.abi,
      functionName: "transferOwnership",
      input: {
        addrTo:fakeAddress
      },
      dest: smcData.address,
      value: 1_000_000_000,
    });

    const res = await smcData.run({
      functionName: "getOwner",
    });

    expect(fakeAddress).to.be.equal(res.value.addrOwner);
  });

  it("get my nft inside root after transfer", async () => {
    const results = await getMyNfts(client, smcData, smcNftRoot.address, smcSafeMultisigWallet);
    console.log(results);
    expect(0).to.be.equal(results.length);
  });

  it("Save the test data", async () => {
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

const getAddrData = async (
  client: TonClient,
  smcNftRoot: TonContract,
  smcSafeMultisigWallet: TonContract
): Promise<TonContract> => {
  let smcData: TonContract;
  const { codeHashData } = (
    await smcNftRoot.run({
      functionName: "resolveCodeHashData",
      input: {},
    })
  ).value;
  
  const Datas = (
    await client.net.query_collection({
      collection: "accounts",
      filter: {
        code_hash: { eq: codeHashData.slice(2) },
      },
      result: "id",
    })
  ).result;

  const promises = Datas.map((el) => {
    const _smcData = new TonContract({
      client,
      name: "",
      tonPackage: pkgData,
      address: el.id,
    });
    return _smcData.run({
      functionName: "getOwner",
    });
  });

  const results = await Promise.all(promises);

  results.forEach((el: any, i) => {
    if (el.value.addrOwner === smcSafeMultisigWallet.address) {
      smcData = new TonContract({
        client,
        name: "Data",
        tonPackage: pkgData,
        address: Datas[i].id,
      });
    }
  });

  return smcData;
};

const getMyNfts = async (
  client: TonClient,
  smcData: TonContract,
  rootAddr: string,
  msig: TonContract
): Promise<any> => {
  const { codeHashIndex } = (
    await smcData.run({
      functionName: "resolveCodeHashIndex",
      input: {
        addrRoot: rootAddr,
        addrOwner: msig.address
      },
    })
  ).value;

  let nfts = [];
  let counter = 0;

  while (nfts.length === 0 && counter <= 500) {
    const qwe = await client.net.query_collection({
      collection: "accounts",
      filter: {
        code_hash: { eq: codeHashIndex.slice(2) },
      },
      result: "id",
    });
    counter++;
    nfts = qwe.result;
  }

  const promises = nfts.map((el) => {
    const _smcNft = new TonContract({
      client,
      name: "",
      tonPackage: pkgIndex,
      address: el.id,
    });
    return _smcNft.run({
      functionName: "getInfo",
    });
  });

  return await Promise.all(promises);
};
