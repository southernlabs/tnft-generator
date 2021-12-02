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
  let metadatas_json: Array<Object>;
  let ipfs_images = {};
  let ipfs_metadatas = {};

  before(async () => {
    client = createClient();
	//let msigKeys = await client.crypto.generate_random_sign_keys();
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

    let msigBalance = await smcSafeMultisigWallet.getBalance()
    expect(msigBalance, "Wallet must have balance to deploy!").not.to.be.equal(0);
	
	// Semi-manual msig deploy, for test network
	if(!process.env.MULTISIG_ADDRESS){
		await smcSafeMultisigWallet.calcAddress();
		
		console.log(`Msig address: ${smcSafeMultisigWallet.address}`);
		//console.log(`Msig keys: `,msigKeys);
		
		msigBalance = await smcSafeMultisigWallet.getBalance()
		console.log(`Msig balance: ${msigBalance}`);
		console.log(`Topup msig balance via tondev:  tondev ct -a ${smcSafeMultisigWallet.address} -v 1000000000000000`);
		//expect(msigBalance).not.to.be.equal(0);
		/*await smcSafeMultisigWallet.deploy({
		  input: {
			owners: ["0x2b036b4370ce5e893780a8418c4b7e038c5a1ad16ce9c7148696c3b03b353a4c"],
			reqConfirms: 1,
		  },
		});*/
		
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
        value: 5_000_000_000,
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

  /*
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
    expect(process.env.MULTISIG_ADDRESS).to.be.equal(res.value.addrOwner);
  });
  */
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
  rootAddr: string
): Promise<any> => {
  const { codeHashIndex } = (
    await smcData.run({
      functionName: "resolveCodeHashIndex",
      input: {
        addrRoot: rootAddr,
        addrOwner: process.env.MULTISIG_ADDRESS
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
